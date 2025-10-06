import { type App, type CachedMetadata, TFile } from "obsidian";
import { EventEmitter } from "./event-emitter";
import { FileWatcher, type FileWatcherEvent } from "./file-watcher";
import { verbose } from "./logger";
import { Parser } from "./parser";
import type { Template } from "./template";
import { alertWrap } from "./utils/alert";
import {
    findLinkPath,
    SnippetRegex,
    WikiLinkPathRegex,
} from "./utils/obsidian";

export type CacheEvent =
    | { name: "template-change"; template: Template }
    | { name: "queue-cleared" };

export class Cache {
    app: App;
    templates = new Map<string, Template>();
    events = new EventEmitter<CacheEvent>();

    #parser: Parser;
    #watcher: FileWatcher;
    #queue: {
        processing: boolean;
        items: FileWatcherEvent[];
    } = { processing: false, items: [] };

    constructor(app: App) {
        this.app = app;
        this.#parser = new Parser(app);
        this.#watcher = new FileWatcher(app);
    }

    get parser() {
        return this.#parser;
    }

    setFolder(path: string | undefined) {
        this.#watcher.setFolder(path);
    }

    enable() {
        return EventEmitter.join(
            this.#watcher.events.on((event) => {
                this.#addQueue(event);
            }),
            this.#watcher.enable(),
        );
    }

    refresh() {
        this.templates.clear();
        for (const [path, metadata] of this.#watcher.metadatas) {
            this.#addQueue({ name: "change", path, metadata });
        }
    }

    #addQueue(event: FileWatcherEvent) {
        if (!this.#queue.processing) {
            this.#process(event);
        } else {
            this.#queue.items.push(event);
        }
    }

    async #process(event: FileWatcherEvent) {
        this.#queue.processing = true;
        await alertWrap(async () => {
            verbose(event);
            if (event.name === "change") {
                const file = this.app.vault.getFileByPath(event.path);
                if (file) await this.#invalidate(file, event.metadata);
            } else if (event.name === "delete") {
                this.remove(event.path);
            }
        });
        this.#queue.processing = false;
    }

    async #invalidate(file: TFile, metadata: CachedMetadata) {
        this.#queue.processing = true;
        this.remove(file.path);

        const template = await this.#parser.parse(file, metadata);
        this.add(template);

        this.#queue.processing = false;

        if (this.#queue.items.length === 0) {
            this.events.trigger({ name: "queue-cleared" });
            verbose("queue-cleared");
        } else {
            const item = this.#queue.items.pop();
            if (item) this.#process(item);
        }
    }

    add(template: Template) {
        const id = template.getIdentifier();
        this.templates.set(id, template);
        this.events.trigger({ name: "template-change", template });
        verbose("template-change", id);
    }

    remove(path: string) {
        const template = this.templates.get(path);
        if (!template) return;

        // Get template and its snippets
        const templates = [...this.templates.values()].filter(
            (t) => t.info.file.path === path,
        );

        for (const template of templates) {
            this.templates.delete(template.getIdentifier());
        }
    }

    resolve(path: string | TFile) {
        let template: Template | undefined;
        let file: TFile | null = null;
        if (path instanceof TFile) {
            file = path;
        } else {
            template = this.templates.get(path);

            if (!template) {
                if (path === "[[]]") {
                    file = this.app.workspace.getActiveFile();
                } else {
                    file = WikiLinkPathRegex.test(path)
                        ? findLinkPath(this.app, path)
                        : this.app.vault.getFileByPath(path);
                }
            }

            if (!template && path.startsWith("snippet")) {
                const match = path.match(SnippetRegex);
                if (match) {
                    template = [...this.templates.values()].find(
                        (t) =>
                            t.isSnippet() &&
                            t.getIdentifier().endsWith(`#${match[1]}`),
                    );
                }
            }
        }

        if (file) {
            template = this.templates.get(file.path);
        }

        return template ?? null;
    }
}
