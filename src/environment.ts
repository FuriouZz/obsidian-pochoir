import {
    type EditorSelectionOrCaret,
    Events,
    MarkdownView,
    type TFile,
    type TFolder,
} from "obsidian";
import { Cache } from "./cache";
import { Editor } from "./editor";
import { PochoirError } from "./errors";
import { EventEmitter } from "./event-emitter";
import { ExtensionList } from "./extension-list";
import { Importer, type Loader } from "./importer";
import { LOGGER } from "./logger";
import type PochoirPlugin from "./main";
import type { ParserParseOptions } from "./parser";
import { type Processor, ProcessorList } from "./processor-list";
import { Renderer } from "./renderer";
import type { ISettings } from "./setting-tab";
import type { Template } from "./template";
import {
    TemplateContext,
    type TemplateContextProvider,
} from "./template-context";
import { TemplateSuggesterSet } from "./template-suggester-set";
import { alertWrap } from "./utils/alert";
import { ensurePath, findOrCreateNote } from "./utils/obsidian";

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
    templateSuggesters: TemplateSuggesterSet;

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
        this.templateSuggesters = new TemplateSuggesterSet();
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
        const contentProcessor = context.get("content");
        if (contentProcessor) {
            await this.app.vault.process(target, (content) =>
                contentProcessor.processTarget(content),
            );
        }

        // Transfer properties
        const properties = await context.transferProps(this.app, target);

        // Generate content
        let templateContent = template.getContent();
        if (contentProcessor) {
            templateContent = contentProcessor.processTemplate(templateContent);
        }
        const content = await this.renderer.render(templateContent, {
            ...context.exports,
            properties,
        });

        console.log(content);

        const write = async () => {
            const cursorReg = new RegExp(/\{\^\}/g);
            return this.app.vault.process(
                target,
                (data) => data + content.replaceAll(cursorReg, ""),
            );
        };

        // Place content
        const activeFile = this.app.workspace.getActiveFile();
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (
            activeFile?.path === target.path &&
            view &&
            view.getMode() !== "preview"
        ) {
            if (view.editor.listSelections().length > 0) {
                view.editor.replaceSelection(content);
            } else {
                await write();
            }

            // Select cursor positions
            const cursorPattern = "{^}";
            const cursorReg = new RegExp(/\{\^\}/);

            const selections: EditorSelectionOrCaret[] = [];
            for (let i = 0; i < view.editor.lineCount(); i++) {
                const line = view.editor.getLine(i);
                const match = line.match(cursorReg);
                if (!match) continue;
                const ch = match.index ?? 0;
                selections.push({
                    anchor: { ch, line: i },
                    head: { ch: ch + cursorPattern.length, line: i },
                });
            }

            view.editor.transaction({
                selections: selections.map((s) => ({
                    from: s.anchor,
                    // to: s.head,
                })),
                changes: selections.map((s) => ({
                    from: s.anchor,
                    to: s.head,
                    text: "",
                })),
            });
        } else {
            await write();
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

            const target = await findOrCreateNote(this.app, context.path.path);
            await this.renderToFile(context, template, target);

            if (openNote) {
                await this.app.workspace.getLeaf(false).openFile(target);
            }
        });
    }

    insertFromTemplate(template: Template) {
        const { app } = this;
        return alertWrap(async () => {
            const target = app.workspace.getActiveFile();
            if (!target) throw new Error("There is no active file");

            const context = new TemplateContext();
            context.path.fromTFile(target);
            context.path.hasChanged = false;
            await template.process(this, context);

            if (context.path.hasChanged) {
                const path = await ensurePath(app, context.path.path);
                await app.vault.rename(target, path);
            }

            await this.renderToFile(context, template, target);
        });
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
            ParserParseOptions,
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
        const error = new PochoirError("Template processing has been aborted");
        if (reject) {
            reject(error);
        } else {
            throw error;
        }
    }
}
