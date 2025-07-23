import { type App, type CachedMetadata, TFile } from "obsidian";
import { PochoirError } from "./errors";
import { EventEmitter } from "./event-emitter";
import { FileWatcher, type FileWatcherEvent } from "./file-watcher";
import { verbose } from "./logger";
import { Parser } from "./parser";
import type { Template } from "./template";
import { alertWrap } from "./utils/alert";
import { findLinkPath, LinkPathRegex } from "./utils/obsidian";

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
                this.templates.delete(event.path);
            }
        });
        this.#queue.processing = false;
    }

    async #invalidate(file: TFile, metadata: CachedMetadata) {
        this.#queue.processing = true;
        this.templates.delete(file.path);

        verbose("parse", file.path);

        const template = await alertWrap(() =>
            this.#parser.parse(file, metadata),
        );
        if (template) {
            this.templates.set(template.info.file.path, template);
            this.events.trigger({ name: "template-change", template });
        }

        this.#queue.processing = false;

        if (this.#queue.items.length === 0) {
            this.events.trigger({ name: "queue-cleared" });
        } else {
            const item = this.#queue.items.pop();
            if (item) this.#process(item);
        }
    }

    resolve(path: string | TFile) {
        let file: TFile | null = null;
        if (path instanceof TFile) {
            file = path;
        } else {
            file = LinkPathRegex.test(path)
                ? findLinkPath(this.app, path)
                : this.app.vault.getFileByPath(path);
        }
        if (!file) throw new PochoirError(`File does not exist: ${path}`);

        const template = this.templates.get(file.path);
        if (!template) {
            throw new PochoirError(`Template does not exist: ${path}`);
        }

        return template;
    }
}
