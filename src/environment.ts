import {
	type EventRef,
	Events,
	MarkdownView,
	normalizePath,
	TFile,
	type TFolder,
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
import { getNewFileLocation } from "./utils";

export type Extension = (env: Environment) => void;

export class Environment extends Events {
	plugin: PochoirPlugin;
	engine: TemplateEngine;
	list: TemplateList;
	parser: Parser;

	frontmatters: FrontmatterProcessor[] = [];
	codeBlocks: CodeBlockProcessor[] = [];
	variables: VariablesProvider[] = [];

	declare on: (
		name: "write",
		callback: (params: {
			pochoir: Environment;
			context: TemplateContext;
			content: string;
		}) => unknown,
		ctx?: unknown,
	) => EventRef;

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
		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on("finished", () => {
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
			...context.exports,
			properties,
		});
	}

	createContext() {
		const context = new TemplateContext();
		for (const p of this.variables) p(context);
		return context;
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
				throw new Error(`${folder} is a file`);
			}
			if (!folderObj) {
				await app.vault.createFolder(folderPath);
			}
			const note = await app.vault.create(filePath, "");

			const context = this.createContext();
			const content = await this.renderTemplate(templateFile, note, context);
			this.trigger("write");
			await app.vault.process(note, (data) => data + content);

			if (openNote) {
				await app.workspace.getLeaf(false).openFile(note);
			}
		} catch (e) {
			logError(e);
		}
	}

	async insertTemplate(templateFile: TFile) {
		try {
			const { app } = this.plugin;
			const note = app.workspace.getActiveFile();
			if (!note) throw new Error("There is no active file");

			const context = this.createContext();
			const content = await this.renderTemplate(templateFile, note, context);
			this.trigger("write");
			const view = app.workspace.getActiveViewOfType(MarkdownView);
			view?.editor.replaceSelection(content);
		} catch (e) {
			logError(e);
		}
	}
}
