import type { App, CachedMetadata, SectionCache, TFile } from "obsidian";
import {
	Template,
	type TemplateCodeBlock,
	TemplateContext,
	type TemplateInfo,
	type VariablesProvider,
} from "./template";

export class Parser {
	cache = new Map<string, TemplateInfo>();

	async parse({
		app,
		file,
		context: parentContext,
		variables,
	}: {
		app: App;
		file: TFile;
		context?: TemplateContext | null;
		variables?: VariablesProvider[];
	}) {
		const info = await this.parseFile(app, file);
		if (!info) throw new Error(`Cannot parse template: ${file.getShortName()}`);

		let context = parentContext;
		if (!context) {
			context = new TemplateContext();
			if (variables) {
				for (const p of variables) p(context);
			}
		}

		return new Template(context, info);
	}

	async parseFile(app: App, file: TFile) {
		const result = this.cache.get(file.path);
		if (result) return result;

		const source = await app.vault.cachedRead(file);
		const metadata = app.metadataCache.getFileCache(file);
		if (!metadata) return null;

		const res = this.parseSections(source, metadata);
		if (!res) return null;

		const info = {
			file,
			source,
			codeBlocks: res.codeBlocks,
			contentSections: res.contentSections,
		};

		this.cache.set(file.path, info);

		return info;
	}

	parseSections(source: string, metadata: CachedMetadata) {
		if (!metadata.sections) return;

		let topSections: SectionCache[] = [];
		const contentSections: SectionCache[] = [];
		let sections = topSections;

		for (const section of metadata.sections) {
			if (section.type === "thematicBreak") {
				sections = contentSections;
				continue; // Ignore thematic break
			}
			sections.push(section);
		}

		const codeBlocks: TemplateCodeBlock[] = [];
		topSections = topSections.filter((section) => {
			const block = this.parseCodeBlock(source, section);
			if (block) codeBlocks.push(block);
			return !block;
		});

		return {
			topSections,
			contentSections,
			codeBlocks,
		};
	}

	parseCodeBlock(
		source: string,
		section: SectionCache,
	): TemplateCodeBlock | null {
		if (section.type !== "code") return null;
		const content = source.slice(
			section.position.start.offset,
			section.position.end.offset,
		);

		const regex = /`{3}(\S+)\s+pochoir\n([\s\S]*?)\n`{3}/;
		const match = content.match(regex);
		if (!match) return null;

		const language = match[1];

		const code = match[2];
		return { language, section, content, code };
	}
}
