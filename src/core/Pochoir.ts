import {
	type App,
	MarkdownView,
	Notice,
	type TFile,
	Events,
	type EventRef,
} from "obsidian";
import type PochoirPlugin from "src/main";
import type { Extension } from "./Extension";
import Parser from "./Parser";
import { type TemplateCodeBlock, TemplateContext } from "./Template";
import { TemplateEngine } from "./TemplateEngine";

export class Pochoir extends Events {
	templateEngine = new TemplateEngine();
	parser: Parser;
	plugin: PochoirPlugin;

	codeBlocks: {
		languages: string[];
		evaluate(
			codeBlock: TemplateCodeBlock,
			context: TemplateContext,
		): Promise<void>;
	}[] = [];

	providers: ((params: {
		provide: (key: string, descriptor: PropertyDescriptor) => void;
	}) => void)[] = [];

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
	}

	enable() {
		this.parser.enable(this.plugin.app.metadataCache);
	}

	disable() {
		this.parser.disable(this.plugin.app.metadataCache);
		this.parser.cache.clear();
	}

	use(extension: Extension) {
		extension(this);
		return this;
	}

	async renderTemplate(file: TFile) {
		const template = await this.parser.parse(this, file);
		if (!template) throw new Error("Unable to parse template");

		const context = new TemplateContext();
		for (const v of this.providers) {
			v({
				provide: (key, descriptor) => {
					Object.defineProperty(context, key, descriptor);
				},
			});
		}

		await template.evaluateCodeBlocks(this, context);
		const content = await template.renderContent(this, context);

		return { context, template, content };
	}

	async insertTemplate(app: App, file: TFile) {
		const activeFile = app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("Not a valid file");
			return;
		}

		const { context, content } = await this.renderTemplate(file);
		const view = app.workspace.getActiveViewOfType(MarkdownView);
		view?.editor.replaceSelection(content);
		this.trigger("template:rendered", { pochoir: this, context, content });
	}
}
