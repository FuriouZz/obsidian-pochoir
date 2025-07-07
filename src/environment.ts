import {
  type EventRef,
  Events,
  MarkdownView,
  normalizePath,
  TFile,
  TFolder,
} from "obsidian";
import { parentFolderPath } from "obsidian-typings/implementations";
import { logError } from "src/log";
import type PochoirPlugin from "src/main";
import { Parser } from "./parser";
import {
  type CodeBlockProcessor,
  type FrontmatterProcessor,
  type Template,
  TemplateContext,
  type VariablesProvider,
} from "./template";
import { TemplateEngine, VentoLoader } from "./template_engine";
import { TemplateList } from "./template_list";
import { findLinkPath, getNewFileLocation } from "./utils";
import { FileBuilder } from "./file";

export type Extension = (env: Environment) => void;

export class Environment extends Events {
  plugin: PochoirPlugin;
  engine: TemplateEngine;
  list: TemplateList;
  parser: Parser;

  frontmatters: FrontmatterProcessor[] = [];
  codeBlocks: CodeBlockProcessor[] = [];
  variables: VariablesProvider[] = [];

  constructor(plugin: PochoirPlugin) {
    super();

    this.plugin = plugin;
    this.parser = new Parser();
    this.engine = new TemplateEngine(new VentoLoader(this));
    this.list = new TemplateList();
    this.plugin.registerEvent(
      this.plugin.app.metadataCache.on("changed", (file) => {
        this.parser.cache.delete(file.path);
        this.engine.vento.cache.delete(file.path);
        this.updateTemplateList();
      }),
    );
  }

  async updateTemplateList() {
    return this.list.refresh(this);
  }

  use(extension: Extension) {
    extension(this);
    return this;
  }

  clear() {
    this.codeBlocks.length = 0;
    this.variables.length = 0;
  }

  async #renderTemplateContent(
    context: TemplateContext,
    template: Template,
    properties?: Record<string, unknown>,
  ) {
    return this.engine.renderTemplate(template, {
      ...context.locals.exports,
      properties,
    });
  }

  async #renameFile(context: TemplateContext, target: TFile) {
    const { app } = this.plugin;
    const { file } = context.locals;
    if (file.hasChanged) {
      if (file.folder) {
        const folder = app.vault.getAbstractFileByPath(file.folder);
        if (folder instanceof TFile) {
          throw new Error(`This is not a folder: ${folder.path}`);
        }
        if (!folder) {
          await app.vault.createFolder(file.folder);
        }
      }
      await app.fileManager.renameFile(target, file.path);
    }
  }

  createContext(target?: TFile) {
    const context = new TemplateContext();
    const { file } = context.locals;
    if (target) {
      file.fromTFile(target);
    }
    for (const p of this.variables) p(context);
    return context;
  }

  async importTemplate(path: string, context: TemplateContext) {
    const file = findLinkPath(this.plugin.app, path);
    if (!file) throw new Error(`Cannot find ${path}`);

    const ctx = this.createContext();
    ctx.globals = context.globals;
    const template = this.list.getTemplateByFile(file);
    await template.evaluateCodeBlocks(ctx, this.codeBlocks);
    await template.evaluateProperties(ctx, this.engine);

    return ctx.locals.exports;
  }

  async parseTemplate(templateFile: TFile) {
    return this.parser.parse({
      app: this.plugin.app,
      file: templateFile,
    });
  }

  async renderTemplate(
    templateFile: TFile,
    note: TFile,
    context: TemplateContext,
  ) {
    const { app } = this.plugin;
    const template = this.list.getTemplateByFile(templateFile);
    await template.evaluateCodeBlocks(context, this.codeBlocks);
    await template.evaluateProperties(context, this.engine);
    const properties = await template.mergeProperties(context, note, app);
    return this.#renderTemplateContent(context, template, properties);
  }

  async createFromTemplate(
    templateFile: TFile,
    {
      filename = "Untitled",
      folder,
      openNote = true,
    }: { folder?: TFolder; filename?: string; openNote?: boolean } = {},
  ) {
    try {
      const { app } = this.plugin;
      const location = folder ?? getNewFileLocation(app);

      let filePath = normalizePath(`${location.path}/${filename}`);
      filePath = app.vault.getAvailablePath(filePath, "md");

      const folderPath = parentFolderPath(filePath);

      const folderObj = app.vault.getAbstractFileByPath(folderPath);
      if (folderObj instanceof TFile) {
        throw new Error(`This is not a folder: ${folderObj.path}`);
      }
      if (!folderObj) {
        await app.vault.createFolder(folderPath);
      }
      const note = await app.vault.create(filePath, "");

      const context = this.createContext(note);
      const content = await this.renderTemplate(templateFile, note, context);
      await app.vault.process(note, (data) => data + content);
      await this.#renameFile(context, note);

      if (openNote) {
        await app.workspace.getLeaf(false).openFile(note);
      }
    } catch (e) {
      logError(e as Error);
    }
  }

  async insertTemplate(templateFile: TFile) {
    try {
      const { app } = this.plugin;
      const note = app.workspace.getActiveFile();
      if (!note) throw new Error("There is no active file");

      const context = this.createContext(note);
      const content = await this.renderTemplate(templateFile, note, context);
      const view = app.workspace.getActiveViewOfType(MarkdownView);
      view?.editor.replaceSelection(content);
      await this.#renameFile(context, note);
    } catch (e) {
      logError(e as Error);
    }
  }
}
