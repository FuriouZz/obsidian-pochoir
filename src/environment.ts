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
import type {
	CodeBlockProcessor,
	Template,
	TemplateContext,
	VariablesProvider,
} from "./template";
import { TemplateEngine, VentoLoader } from "./template_engine";
import { getNewFileLocation } from "./utils";

export type Extension = (env: Environment) => void;

export class Environment extends Events {
	templateEngine = new TemplateEngine(new VentoLoader(this));
	parser: Parser;
	plugin: PochoirPlugin;

	codeBlockProcessor: CodeBlockProcessor[] = [];
	variables: VariablesProvider[] = [];

	declare on: (
		name: "template:rendered",
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

	clear() {
		this.codeBlockProcessor.length = 0;
		this.variables.length = 0;
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

	async parseTemplate(
		templateFile: TFile,
		parentContext?: TemplateContext | null,
	) {
		return this.parser.parse({
			app: this.plugin.app,
			file: templateFile,
			context: parentContext,
			variables: this.variables,
		});
	}

	async renderTemplate(templateFile: TFile, note: TFile) {
		const { app } = this.plugin;
		const template = await this.parseTemplate(templateFile);
		await template.evaluateCodeBlocks(this.codeBlockProcessor);
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

			const content = await this.renderTemplate(templateFile, note);
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

			const content = await this.renderTemplate(templateFile, note);
			const view = app.workspace.getActiveViewOfType(MarkdownView);
			view?.editor.replaceSelection(content);
		} catch (e) {
			logError(e);
		}
	}
}
