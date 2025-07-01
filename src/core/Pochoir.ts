import {
	type EventRef,
	Events,
	MarkdownView,
	normalizePath,
	TFile,
	type TFolder,
} from "obsidian";
import { parentFolderPath } from "obsidian-typings/implementations";
import type PochoirPlugin from "src/main";
import type { Extension } from "./Extension";
import Parser from "./Parser";
import {
	Template,
	type TemplateCodeBlockProcessor,
	TemplateContext,
	type TemplateContextProvider,
} from "./Template";
import { TemplateEngine } from "./TemplateEngine";
import { getNewFileLocation } from "./utils";

export class Pochoir extends Events {
	templateEngine = new TemplateEngine(this);
	parser: Parser;
	plugin: PochoirPlugin;

	codeBlockProcessors: TemplateCodeBlockProcessor[] = [];
	contextProviders: TemplateContextProvider[] = [];

	declare on: (
		name: "template:rendered",
		callback: (params: {
			pochoir: Pochoir;
			context: TemplateContext;
			content: string;
		}) => unknown,
		ctx?: unknown,
	) => EventRef;

	constructor(plugin: PochoirPlugin) {
		super();

		this.plugin = plugin;
		this.parser = new Parser();
		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on("changed", (file) => {
				this.parser.cache.delete(file.path);
				this.templateEngine.vento.cache.delete(file.path);
			}),
		);
	}

	use(extension: Extension) {
		extension(this);
		return this;
	}

	async #renderTemplateContent(
		template: Template,
		properties?: Record<string, unknown>,
	) {
		return this.templateEngine.renderTemplate(template, {
			...template.context.exports,
			properties,
		});
	}

	async parseTemplate(file: TFile, parentContext?: TemplateContext | null) {
		const info = await this.parser.parse(this.plugin.app, file);
		if (!info) throw new Error("Unable to parse template");

		let context: TemplateContext;
		if (parentContext) {
			context = parentContext;
		} else {
			context = new TemplateContext();
			for (const p of this.contextProviders) p(context);
		}

		return new Template(context, info);
	}

	async renderTemplate(templateFile: TFile, note: TFile) {
		const { app } = this.plugin;
		const template = await this.parseTemplate(templateFile);
		await template.evaluateCodeBlocks(this.codeBlockProcessors);
		const properties = await template.mergeProperties(note, app);
		return this.#renderTemplateContent(template, properties);
	}

	async createFromTemplate(
		templateFile: TFile,
		{
			filename = "Untitled",
			folder,
			openNote = true,
		}: { folder?: TFolder; filename?: string; openNote?: boolean } = {},
	) {
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

		const content = await this.renderTemplate(templateFile, note);
		await app.vault.process(note, (data) => data + content);

		if (openNote) {
			await app.workspace.getLeaf(false).openFile(note);
		}
	}

	async insertTemplate(templateFile: TFile) {
		const { app } = this.plugin;
		const note = app.workspace.getActiveFile();
		if (!note) throw new Error("There is no active file");

		const content = await this.renderTemplate(templateFile, note);
		const view = app.workspace.getActiveViewOfType(MarkdownView);
		view?.editor.replaceSelection(content);
	}
}
