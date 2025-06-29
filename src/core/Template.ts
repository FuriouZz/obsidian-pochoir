import type { SectionCache } from "obsidian";
import type { Pochoir } from "./Pochoir";

export class TemplateContext {
	exports: Record<string, unknown> = {};
}

export class TemplateCodeBlock {
	constructor(
		public language: string,
		public section: SectionCache,
		public content: string,
		public code: string,
	) {}
}

export class Template {
	constructor(
		public source: string,
		public codeBlocks: TemplateCodeBlock[],
		public contentSections: SectionCache[],
	) {}

	getContent() {
		if (this.contentSections.length === 0) return "";
		const first = this.contentSections[0];
		const last = this.contentSections[this.contentSections.length - 1];
		const start = first.position.start.offset;
		const end = last.position.end.offset;
		return this.source.slice(start, end);
	}

	async evaluateCodeBlocks(pochoir: Pochoir, cx: TemplateContext) {
		for (const code of this.codeBlocks) {
			const ext = pochoir.codeBlocks.find(({ languages }) => {
				return languages.includes(code.language);
			});
			await ext?.evaluate(code, cx);
		}
	}

	async renderContent(pochoir: Pochoir, cx: TemplateContext) {
		const content = this.getContent();
		return pochoir.templateEngine.render(content, cx);
	}
}
