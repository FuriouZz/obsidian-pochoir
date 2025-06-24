import { type App, MarkdownView, moment, Notice, type TFile } from "obsidian";
import Parser from "./Parser";
import { Template, TemplateContext } from "./Template";
import { vento } from "./vento";

export default class Pochoir {
	vento = vento({
		dataVarname: "pochoir",
		autoDataVarname: true,
	});

	async parseTemplate(app: App, file: TFile) {
		const parser = new Parser();
		const tpl = await parser.parse(app, file);
		if (!tpl) return null;
		const template = new Template(
			tpl.source,
			tpl.codeBlocks,
			tpl.contentSections,
		);
		template.processor = async ({ context, content }) => {
			const result = await this.vento.runString(content, context.variables);
			return result.content as string;
		};
		return template;
	}

	injectInternalFunctions(app: App, context: TemplateContext) {
		Object.defineProperty(context.variables, "include", {
			configurable: false,
			enumerable: true,
			writable: false,
			value: async (path: string) => {
				const regex = /^\[\[(.*)\]\]$/;
				const match = regex.exec(path);
				if (!match) return;

				const file = app.metadataCache.getFirstLinkpathDest(match[1], "");
				if (!file) return;

				const template = await this.parseTemplate(app, file);
				if (!template) return;

				await template.evaluateCodeBlocks(context);
				return template.renderContent(context);
			},
		});

		Object.defineProperty(context.variables, "today", {
			configurable: false,
			enumerable: true,
			writable: false,
			value: (format = "YYYY-MM-DD") => {
				return moment().format(format);
			},
		});
	}

	async insertTemplate(app: App, file: TFile) {
		const activeFile = app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("Not a valid file");
			return;
		}

		const context = new TemplateContext();
		this.injectInternalFunctions(app, context);

		const template = await this.parseTemplate(app, file);
		if (!template) {
			new Notice("Unable to parse template");
			return;
		}

		await template.evaluateCodeBlocks(context);
		const res = await template.renderContent(context);

		const view = app.workspace.getActiveViewOfType(MarkdownView);
		view?.editor.replaceSelection(res.content);
		view?.metadataEditor?.insertProperties(res.frontmatter);
	}
}
