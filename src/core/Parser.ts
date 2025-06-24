import type { App, CachedMetadata, SectionCache, TFile } from "obsidian";
import { TemplateCodeBlock } from "./Template";

export default class Parser {
	async parse(app: App, template: TFile) {
		const source = await app.vault.read(template);
		const cache = app.metadataCache.getFileCache(template);
		if (!cache) return null;

		const res = this.parseSections(source, cache);
		if (!res) return null;

		return { source, ...res };
	}

	parseSections(source: string, cache: CachedMetadata) {
		if (!cache.sections) return;

		let topSections: SectionCache[] = [];
		const contentSections: SectionCache[] = [];
		let sections = topSections;

		for (const section of cache.sections) {
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

	parseCodeBlock(source: string, section: SectionCache) {
		if (section.type !== "code") return null;
		const content = source.slice(
			section.position.start.offset,
			section.position.end.offset,
		);

		const regex = /`{3}(js|javascript|yml|yaml)\s+pochoir\n([\s\S]*?)\n`{3}/;
		const match = content.match(regex);
		if (!match) return null;

		const lang = (() => {
			switch (match[1]) {
				case "yaml":
				case "yml":
					return "yml";
				case "javascript":
				case "js":
					return "js";
			}
		})();

		if (!lang) return null;

		const code = match[2];
		return new TemplateCodeBlock(lang, section, content, code);
	}
}
