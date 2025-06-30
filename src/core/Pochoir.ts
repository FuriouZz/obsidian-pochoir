import {
	type App,
	type EventRef,
	Events,
	MarkdownView,
	type TFile,
} from "obsidian";
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

	async #renderTemplate(
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

	async insertTemplate(app: App, file: TFile) {
		const activeFile = app.workspace.getActiveFile();
		if (!activeFile) throw new Error("There is no active file");

		const template = await this.parseTemplate(file);

		await template.evaluateCodeBlocks(this.codeBlockProcessors);

		const view = app.workspace.getActiveViewOfType(MarkdownView);
		const $properties = template.context.globals.$properties;
		view?.metadataEditor?.insertProperties($properties.toObject());

		const properties = view?.metadataEditor?.serialize();
		const content = await this.#renderTemplate(template, properties);
		view?.editor.replaceSelection(content);
	}
}
