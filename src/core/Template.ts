import type { SectionCache, TFile } from "obsidian";
import PropertiesBuilder from "./PropertiesBuilder";

export interface TemplateInfo {
	file: TFile;
	source: string;
	codeBlocks: TemplateCodeBlock[];
	contentSections: SectionCache[];
}

export interface TemplateCodeBlock {
	language: string;
	section: SectionCache;
	content: string;
	code: string;
}

export type TemplateCodeBlockProcessor = (params: {
	codeBlock: TemplateCodeBlock;
	template: Template;
}) => boolean | Promise<boolean>;

export type TemplateContextProvider = (context: TemplateContext) => void;

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
	constructor(
		public context: TemplateContext,
		public info: TemplateInfo,
	) {}

	get globals() {
		return this.context.globals;
	}

	get exports() {
		return this.context.exports;
	}

	getContent() {
		const { contentSections, source } = this.info;
		if (contentSections.length === 0) return "";
		const first = contentSections[0];
		const last = contentSections[contentSections.length - 1];
		const start = first.position.start.offset;
		const end = last.position.end.offset;
		return source.slice(start, end);
	}

	async evaluateCodeBlocks(processors: TemplateCodeBlockProcessor[]) {
		for (const codeBlock of this.info.codeBlocks) {
			for (const processor of processors) {
				const promise = processor({ codeBlock, template: this });
				const res = await Promise.resolve(promise);
				if (res) break;
			}
		}
	}
}
