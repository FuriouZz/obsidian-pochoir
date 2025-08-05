import { Events, MarkdownView, type TFolder } from "obsidian";
import { Cache } from "./cache";
import { EventEmitter } from "./event-emitter";
import { ExtensionList } from "./extension-list";
import { Importer, type Loader } from "./importer";
import type PochoirPlugin from "./main";
import {
    type Preprocessor,
    type Processor,
    ProcessorList,
} from "./processor-list";
import { Renderer } from "./renderer";
import type { ISettings } from "./setting-tab";
import { type Template, TemplateContext } from "./template";
import { alertWrap } from "./utils/alert";
import { ensurePath, findOrCreateNote } from "./utils/obsidian";
import { Editor } from "./editor";

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

    preprocessors = new ProcessorList<Preprocessor>();
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
    }

    get app() {
        return this.plugin.app;
    }

    updateSettings(settings: ISettings) {
        this.cache.setFolder(settings.templates_folder);
        this.editor.updateCommandSuggestion(this);
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
        this.preprocessors.clear();
        this.cache.templates.clear();
        this.renderer.vento.cache.clear();
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
            view?.editor.replaceSelection(content);
        } else {
            await this.app.vault.process(
                context.target,
                (data) => data + content,
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
}
