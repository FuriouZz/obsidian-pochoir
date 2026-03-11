import { Events, MarkdownView, type TFile, type TFolder } from "obsidian";
import { alertWrap } from "./alert";
import { Cache } from "./cache";
import { promptTextConfirmation } from "./confirmation-modal";
import { PochoirError } from "./errors";
import { EventEmitter } from "./event-emitter";
import { ExtensionList } from "./extension-list";
import { Importer, type Loader } from "./importer";
import { LOGGER } from "./logger";
import { CursorJumper } from "./obsidian/cursor-jumper";
import { ensurePath, findNote, findOrCreateNote } from "./obsidian/functions";
import type { ParserParseFromSourceOptions } from "./parser";
import { Editor } from "./plugin/editor";
import type { PochoirPlugin } from "./plugin/plugin";
import type { ISettings } from "./plugin/setting-tab";
import { type Processor, ProcessorList } from "./processor-list";
import { Renderer } from "./renderer";
import type { Template } from "./template";
import {
    TemplateContext,
    type TemplateContextProvider,
} from "./template-context";
import type { TemplateSuggester } from "./types/pochoir";

export interface Extension {
    name: string;
    settings?: {
        label?: string;
        desc?: string;
    };
    setup(env: Environment): void;
}

export class Environment extends Events {
    plugin: PochoirPlugin;
    cache: Cache;
    renderer: Renderer;
    importer: Importer;
    extensions: ExtensionList;
    editor: Editor;
    templateSuggesters: Set<TemplateSuggester>;
    cursorJumper: CursorJumper;

    processors = new ProcessorList<Processor>();
    contextProviders: TemplateContextProvider[] = [];
    loaders: Loader[] = [];

    constructor(plugin: PochoirPlugin) {
        super();

        const findTemplate = (path: string) => {
            const file = this.app.vault.getFileByPath(path);
            if (!file) return null;
            return this.cache.resolve(file);
        };

        this.plugin = plugin;
        this.cache = new Cache(this.app);
        this.renderer = new Renderer(this.app, { findTemplate });
        this.importer = new Importer(this);
        this.extensions = new ExtensionList();
        this.editor = new Editor(this);
        this.templateSuggesters = new Set<TemplateSuggester>();
        this.cursorJumper = new CursorJumper(this.app);
    }

    get app() {
        return this.plugin.app;
    }

    refresh(settings: ISettings) {
        this.cleanup();
        this.cache.setFolder(settings.templates_folder);
        this.extensions.run(this);
        this.editor.updateHightlighterInReadingMode(this);
    }

    enable() {
        const off = EventEmitter.join(
            this.cache.events.on((event) => {
                if (event.name === "queue-cleared") {
                    for (const template of this.cache.templates.values()) {
                        template.preprocess(this).catch(LOGGER.error);
                    }
                } else if (event.name === "template-change") {
                    this.renderer.vento.cache.delete(
                        event.template.info.file.path,
                    );
                }
            }),
            this.cache.enable(),
        );
        this.cache.refresh();
        return off;
    }

    cleanup() {
        this.contextProviders.length = 0;
        this.loaders.length = 0;
        this.processors.clear();
        this.cache.templates.clear();
        this.renderer.vento.cache.clear();
        this.templateSuggesters.clear();
    }

    async renderToFile(
        context: TemplateContext,
        template: Template,
        target: TFile,
    ) {
        const content = await template.render(this, context, target);

        const writeFile = (content: string, target: TFile) => {
            return this.app.vault.process(target, (data) => {
                return data + content;
            });
        };

        const writeView = async (content: string, view: MarkdownView) => {
            const cursor = context.get("cursor") ?? view.editor.getCursor();
            const selections = context.get("selections");
            if (selections && selections.length > 0) {
                view.editor.transaction({
                    changes: selections.map((s) => {
                        let from = s.anchor;
                        let to = s.head;

                        if (
                            s.anchor.line > s.head.line ||
                            (s.anchor.line === s.head.line &&
                                s.anchor.ch > s.head.ch)
                        ) {
                            from = s.head;
                            to = s.anchor;
                        }

                        return { from, to, text: content };
                    }),
                });
            } else if (cursor) {
                view.editor.transaction({
                    changes: [
                        {
                            from: cursor,
                            text: content,
                        },
                    ],
                });
            } else {
                await writeFile(content, target);
            }
        };

        // Place content
        const activeFile = this.app.workspace.getActiveFile();
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (
            activeFile?.path === target.path &&
            view &&
            view.getMode() !== "preview"
        ) {
            await writeView(content, view);
            this.cursorJumper.parse();
            this.cursorJumper.jump();
        } else {
            await writeFile(content, target);
        }
    }

    async createFromTemplate(
        template: Template,
        {
            filename = "Untitled.md",
            folder,
            openNote = true,
        }: { folder?: TFolder; filename?: string; openNote?: boolean } = {},
    ) {
        const path = folder ? `${folder.path}/${filename}` : filename;

        return alertWrap(async () => {
            const context = new TemplateContext();
            context.path.path = path;
            context.path.hasChanged = false;
            await template.process(this, context);
            await this.confirmName(context);

            let target = findNote(this.app, context.path.path);
            if (target && context.options.includes("openIfExists")) {
                await this.app.workspace.getLeaf(false).openFile(target);
            } else {
                target = await findOrCreateNote(this.app, context.path.path);
                await this.renderToFile(context, template, target);
                if (openNote) {
                    await this.app.workspace.getLeaf(false).openFile(target);
                }
            }
        });
    }

    insertFromTemplate(template: Template) {
        const { app } = this;
        return alertWrap(async () => {
            const target = app.workspace.getActiveFile();
            if (!target) throw new Error("There is no active file");

            const view = app.workspace.getActiveViewOfType(MarkdownView);

            const context = new TemplateContext();

            context.set("cursor", view?.editor.getCursor());
            context.set("selections", view?.editor.listSelections());

            context.path.fromTFile(target);
            context.path.hasChanged = false;
            await template.process(this, context);
            await this.confirmName(context);

            const newTarget = findNote(this.app, context.path.path);

            if (newTarget && context.options.includes("openIfExists")) {
                await this.app.workspace.getLeaf(false).openFile(newTarget);
            } else {
                if (!newTarget && context.path.hasChanged) {
                    const path = await ensurePath(app, context.path.path);
                    await app.fileManager.renameFile(target, path);
                }

                await this.renderToFile(context, template, target);
            }
        });
    }

    async confirmName(context: TemplateContext) {
        if (context.options.includes("confirmName")) {
            const path = await promptTextConfirmation(this.app, {
                defaultValue: context.path.path,
                onCancel: () => this.abortTemplate(),
            });
            if (path) context.path.path = path;
        }
    }

    async createVirtualTemplate(
        options: (
            | { type: "clipboard" }
            | { type: "selection" }
            | {
                  type: "source";
                  source: string;
              }
        ) &
            ParserParseFromSourceOptions,
    ) {
        const { app } = this;
        const file = this.app.workspace.getActiveFile();
        if (!file) return;

        let source: string | undefined;
        if (options.type === "selection") {
            source = app.workspace
                .getActiveViewOfType(MarkdownView)
                ?.editor.getSelection();
        } else if (options.type === "clipboard") {
            source = await globalThis.navigator.clipboard.readText();
        } else if (options.type === "source") {
            source = options.source;
        }

        if (!source) return;

        const template = this.cache.parser.parseFromSource(
            source,
            file,
            options,
        );

        return template;
    }

    abortTemplate(reject?: (e: unknown) => void) {
        const error = new PochoirError("Template creation has been aborted", {
            prefix: "Pochoir",
            verbose: false,
        });
        if (reject) {
            reject(error);
        } else {
            throw error;
        }
    }
}
