import { Events, MarkdownView, type TFile, type TFolder } from "obsidian";
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
import { type Template, TemplateContext } from "./template";
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
        // Transfer properties
        const properties = await context.transferProps(this.app, target);

        // Generate content
        const content = await this.renderer.render(template.getContent(), {
            ...context.locals.exports,
            properties,
        });

        // Search cursor position
        const cursorPattern = "{^}";
        const cursorReg = new RegExp(/\{\^\}/);
        const cursorLines = content
            .split("\n")
            .map((line, index) => {
                const match = line.match(cursorReg);
                if (!match) return null;
                return { line: index, ch: match.index ?? 0 };
            })
            .filter((item) => item !== null);

        // Place content
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile?.path === target.path) {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            const cursor = view?.editor.getCursor();
            view?.editor.replaceSelection(content);

            if (cursor) {
                if (cursorLines.length > 0) {
                    const selections = cursorLines.map((line) => {
                        return {
                            anchor: {
                                ch: line.ch,
                                line: cursor.line + line.line,
                            },
                            head: {
                                ch: line.ch + cursorPattern.length,
                                line: cursor.line + line.line,
                            },
                        };
                    });
                    view?.editor.setSelections(selections);
                } else {
                    view?.editor.setCursor(cursor);
                }
            }
        } else {
            await this.app.vault.process(target, (data) => data + content);
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
