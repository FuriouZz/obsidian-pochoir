import type {
	CachedMetadata,
	MetadataCache,
	SectionCache,
	TFile,
} from "obsidian";
import type Pochoir from "./Pochoir";
import { Template, TemplateCodeBlock } from "./Template";

export default class Parser {
	cache = new Map<TFile, Template>();

	enable(metadataCache: MetadataCache) {
		metadataCache.on("changed", this.#clearCachedTemplate);
	}

	disable(metadataCache: MetadataCache) {
		metadataCache.off("changed", this.#clearCachedTemplate);
	}

	#clearCachedTemplate = (file: TFile) => {
		this.cache.delete(file);
	};

	async parse(pochoir: Pochoir, file: TFile) {
		const { app } = pochoir.plugin;
		const result = this.cache.get(file);
		if (result) return result;

		const source = await app.vault.read(file);
		const cache = app.metadataCache.getFileCache(file);
		if (!cache) return null;

		const res = this.parseSections(pochoir, source, cache);
		if (!res) return null;

		const template = new Template(source, res.codeBlocks, res.contentSections);
		this.cache.set(file, template);

		return template;
	}

	parseSections(pochoir: Pochoir, source: string, cache: CachedMetadata) {
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
			const block = this.parseCodeBlock(pochoir, source, section);
			if (block) codeBlocks.push(block);
			return !block;
		});

		return {
			topSections,
			contentSections,
			codeBlocks,
		};
	}

	parseCodeBlock(pochoir: Pochoir, source: string, section: SectionCache) {
		if (section.type !== "code") return null;
		const content = source.slice(
			section.position.start.offset,
			section.position.end.offset,
		);

		const regex = /`{3}(\S+)\s+pochoir\n([\s\S]*?)\n`{3}/;
		const match = content.match(regex);
		if (!match) return null;

		const lang = match[1];
		for (const block of pochoir.codeBlocks) {
			if (block.languages.includes(lang)) {
				const code = match[2];
				return new TemplateCodeBlock(lang, section, content, code);
			}
		}

		return null;
	}
}
