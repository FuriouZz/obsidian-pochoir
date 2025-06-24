import type { SectionCache } from "obsidian";
import FrontmatterBuilder from "./FrontmatterBuilder";
import { createAsyncFunction } from "./utils";

// export interface Context {
// 	frontmatter: FrontmatterBuilder;
// 	internal: Record<string, unknown>;
// 	user: Record<string, unknown>;
// }

export type Context = any;

export interface TemplateConfig {
	suggestedName: string;
	confirmName: boolean;
	openIfExists: boolean;
	command?: string;
}

export class TemplateCodeBlock {
	execute: (cx: Context) => Promise<void>;

	constructor(
		public language: "js" | "yml",
		public section: SectionCache,
		public content: string,
		public code: string,
	) {
		this.execute = async (cx: Context) => {
			const code: string[] = [];
			if (language === "yml") {
				code.push(`const {${Object.keys(cx)}} = pochoir;`);
				code.push(`pochoir.frontmatter.$builder.fromYaml(\`${this.code}\`)`);
			} else {
				code.push(this.code);
			}
			await createAsyncFunction(code.join("\n"), "pochoir")(cx);
		};
	}
}

export class TemplateContext {
	frontmatter = new FrontmatterBuilder();
	// @ts-ignore:
	variables: Record<string | symbol, unknown> & {
		frontmatter: ReturnType<FrontmatterBuilder["createProxy"]>;
	} = {};

	constructor() {
		Object.defineProperty(this.variables, "frontmatter", {
			value: this.frontmatter.createProxy(),
			enumerable: true,
			writable: false,
			configurable: false,
		});
	}
}

export class Template {
	processor?: (params: { context: TemplateContext; content: string }) =>
		| string
		| Promise<string>;

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

	async evaluateCodeBlocks(cx: TemplateContext) {
		for (const code of this.codeBlocks) {
			await code.execute(cx.variables);
		}
	}

	async renderContent(cx: TemplateContext) {
		const frontmatter = cx.variables.frontmatter;
		const content = this.getContent();
		if (!this.processor) return { content, frontmatter };
		const result = await Promise.resolve(
			this.processor({ context: cx, content }),
		);
		return { content: result, frontmatter: cx.frontmatter.toObject() };
	}
}
