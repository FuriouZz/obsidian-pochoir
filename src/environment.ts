import { Events, MarkdownView, type TFolder } from "obsidian";
import { Cache } from "./cache";
import { Editor } from "./editor";
import { EventEmitter } from "./event-emitter";
import { ExtensionList } from "./extension-list";
import { Importer, type Loader } from "./importer";
import type PochoirPlugin from "./main";
import { type Processor, ProcessorList } from "./processor-list";
import { Renderer } from "./renderer";
import type { ISettings } from "./setting-tab";
import { type Template, TemplateContext } from "./template";
import { TemplateSuggesterSet } from "./template-suggester-set";
import { alertWrap } from "./utils/alert";
import {
    ensurePath,
    findOrCreateNote,
    placeCursorInRange,
} from "./utils/obsidian";

export interface Extension {
    name: string;
    settings?: {
        label?: string;
        desc?: string;
    };
    setup(env: Environment): void;
}

export type ContextProvider = (
    context: TemplateContext,
    template: Template,
) => void | Promise<void>;

export class Environment extends Events {
    plugin: PochoirPlugin;
    cache: Cache;
    renderer: Renderer;
    importer: Importer;
    extensions: ExtensionList;
    editor: Editor;
    templateSuggesters: TemplateSuggesterSet;

    processors = new ProcessorList<Processor>();
    contextProviders: ContextProvider[] = [];
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
        this.templateSuggesters = new TemplateSuggesterSet();
    }

    get app() {
        return this.plugin.app;
    }

    updateSettings(settings: ISettings) {
        this.cache.setFolder(settings.templates_folder);
    }

    enable() {
        const off = EventEmitter.join(
            this.cache.events.on((event) => {
                if (event.name === "queue-cleared") {
                    for (const template of this.cache.templates.values()) {
                        template.preprocess(this);
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

    async renderContent(context: TemplateContext, template: Template) {
        // Rename file
        if (context.path.hasChanged) {
            const file = this.app.vault.getFileByPath(context.path.path);
            if (!file) {
                const path = await ensurePath(
                    this.app,
                    context.path.name,
                    context.path.parent,
                );
                await this.app.fileManager.renameFile(context.target, path);
            } else {
                await this.app.vault.trash(context.target, false);
                context.target = file;
            }
        }

        // Transfer properties
        const properties = await context.transferProps(this.app);

        // Generate content
        const content = await this.renderer.render(template.getContent(), {
            ...context.locals.exports,
            properties,
        });

        // Place content
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile?.path === context.target.path) {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);

            const cursor = view?.editor.getCursor();
            view?.editor.replaceSelection(content);
            if (cursor) view?.editor.setCursor(cursor);

            // // Place cursor
            // if (view && cursor) {
            //     placeCursorInRange(this.app, cursor.line);
            // }
        } else {
            await this.app.vault.process(
                context.target,
                (data) => data + content, //.replaceAll("[^]", ""),
            );
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
        return alertWrap(async () => {
            const target = await findOrCreateNote(
                this.app,
                folder ? `${folder.path}/${filename}` : filename,
            );

            const context = new TemplateContext(target);
            await template.process(this, context);
            await this.renderContent(context, template);

            if (openNote) {
                await this.app.workspace
                    .getLeaf(false)
                    .openFile(context.target);
            }
        });
    }

    insertFromTemplate(template: Template) {
        const { app } = this;
        return alertWrap(async () => {
            const target = app.workspace.getActiveFile();
            if (!target) throw new Error("There is no active file");

            const context = new TemplateContext(target);
            await template.process(this, context);
            await this.renderContent(context, template);
        });
    }

    async createVirtualTemplate(
        options:
            | { type: "clipboard" }
            | { type: "selection" }
            | { type: "source"; source: string },
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
            source = await navigator.clipboard.readText();
        } else if (options.type === "source") {
            source = options.source;
        }

        if (!source) return;

        return this.cache.parser.fromSource(source, file);
    }
}
