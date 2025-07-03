import type { App, FrontMatterCache, SectionCache, TFile } from "obsidian";
import { PropertiesBuilder } from "./properties_builder";

export interface TemplateInfo {
	file: TFile;
	source: string;
	codeBlocks: TemplateCodeBlock[];
	contentSections: SectionCache[];
	frontmatter?: FrontMatterCache;
}

export interface TemplateCodeBlock {
	language: string;
	section: SectionCache;
	content: string;
	code: string;
	attributes: Record<string, unknown>;
}

export type FrontmatterProcessor = (params: {
	context: TemplateContext;
	frontmatter: FrontMatterCache;
}) => void | Promise<void>;

export type CodeBlockProcessor = (params: {
	context: TemplateContext;
	codeBlock: TemplateCodeBlock;
}) => boolean | Promise<boolean>;

export type VariablesProvider = (context: TemplateContext) => void;

export class TemplateContext {
	globals: Record<string, unknown> & {
		$properties: PropertiesBuilder;
		properties: ReturnType<PropertiesBuilder["createProxy"]>;
	};
	exports: Record<string, unknown>;

	constructor() {
		const $properties = new PropertiesBuilder();
		const properties = $properties.createProxy();
		this.globals = {
			properties: properties,
			$properties: $properties,
		};
		this.exports = {};
	}
}

export class Template {
	constructor(public info: TemplateInfo) {}

	getContent() {
		const { contentSections, source } = this.info;
		if (contentSections.length === 0) return "";
		const first = contentSections[0];
		const last = contentSections[contentSections.length - 1];
		const start = first.position.start.offset;
		const end = last.position.end.offset;
		return source.slice(start, end);
	}

	async evaluateFrontmatter(
		context: TemplateContext,
		processors: FrontmatterProcessor[],
	) {
		const { frontmatter } = this.info;
		if (!frontmatter) return;
		for (const processor of processors) {
			const promise = processor({ context, frontmatter });
			await Promise.resolve(promise);
		}
	}

	async evaluateCodeBlocks(
		context: TemplateContext,
		processors: CodeBlockProcessor[],
	) {
		for (const codeBlock of this.info.codeBlocks) {
			for (const processor of processors) {
				const promise = processor({ context, codeBlock });
				const res = await Promise.resolve(promise);
				if (res) break;
			}
		}
	}

	async mergeProperties(context: TemplateContext, file: TFile, app: App) {
		let properties: Record<string, unknown> = {};
		await app.fileManager.processFrontMatter(file, (fm) => {
			context.globals.$properties.toFrontmatter(fm);
			properties = structuredClone(fm);
		});
		return properties;
	}
}
