import { MarkdownView, type TFile, type TFolder } from "obsidian";
import { Cache } from "./cache";
import { Importer, type Loader } from "./importer";
import { verbose } from "./logger";
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
import { createNote, ensurePath } from "./utils/obsidian";

export type Extension = (env: Environment) => void;

export type ContextProvider = (
    context: TemplateContext,
    template: Template,
) => void | Promise<void>;

export class Environment {
    plugin: PochoirPlugin;
    cache: Cache;
    renderer: Renderer;
    importer: Importer;

    preprocessors = new ProcessorList<Preprocessor>();
    processors = new ProcessorList<Processor>();
    contextProviders: ContextProvider[] = [];
    loaders: Loader[] = [];

    constructor(plugin: PochoirPlugin) {
        const findTemplate = (path: string) => {
            const file = this.app.vault.getFileByPath(path);
            if (!file) return null;
            return this.cache.resolve(file);
        };

        this.plugin = plugin;
        this.cache = new Cache(this.app);
        this.renderer = new Renderer(this.app, { findTemplate });
        this.importer = new Importer(this);

        this.plugin.registerEvent(
            this.cache.on("template-changed", async (template) => {
                await template.preprocess(this);
            }),
        );
    }

    get app() {
        return this.plugin.app;
    }

    use(extension: Extension) {
        extension(this);
        return this;
    }

    getSupportedCodeBlocks() {
        return {
            ...this.preprocessors.getSupportedCodeBlock(),
            ...this.processors.getSupportedCodeBlock(),
        };
    }

    async updateSettings(settings: ISettings) {
        this.cache.templateFolder = settings.templates_folder;
        await this.invalidate();
    }

    async invalidate() {
        verbose("invalidate");
        await this.cache.refresh();
    }

    async invalidateFile(file: TFile) {
        this.renderer.vento.cache.delete(file.path);
        await this.cache.invalidate(file);
    }

    cleanup() {
        this.contextProviders.length = 0;
        this.loaders.length = 0;
        this.processors.clear();
        this.preprocessors.clear();
        this.cache.templates.clear();
        this.renderer.vento.cache.clear();
    }

    async renderTemplate(context: TemplateContext, template: Template) {
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

        // Rename file
        if (context.path.hasChanged) {
            const path = await ensurePath(
                this.app,
                context.path.name,
                context.path.parent,
            );
            await this.app.fileManager.renameFile(context.target, path);
        }
    }

    async createFromTemplate(
        template: Template,
        {
            filename = "Untitled",
            folder,
            openNote = true,
        }: { folder?: TFolder; filename?: string; openNote?: boolean } = {},
    ) {
        let createdNote: TFile | undefined;
        return alertWrap(
            async () => {
                const target = await createNote(this.app, filename, folder);
                createdNote = target;

                const context = new TemplateContext(target);
                await template.process(this, context);
                await this.renderTemplate(context, template);

                if (openNote) {
                    await this.app.workspace.getLeaf(false).openFile(target);
                }
            },
            () => {
                if (!createdNote) return;
                this.app.vault.delete(createdNote);
            },
        );
    }

    insertFromTemplate(template: Template) {
        const { app } = this;
        return alertWrap(async () => {
            const target = app.workspace.getActiveFile();
            if (!target) throw new Error("There is no active file");

            const context = new TemplateContext(target);
            await template.process(this, context);
            await this.renderTemplate(context, template);
        });
    }
}
