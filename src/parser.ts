import type { App, CachedMetadata, SectionCache, TFile } from "obsidian";
import { parseYaml } from "./utils/obsidian";
import { PochoirError } from "./errors";
import { PropertiesBuilder } from "./properties-builder";
import { Template } from "./template";

export interface ParsedCodeBlock {
    language: string;
    section: SectionCache;
    content: string;
    code: string;
    attributes: Record<string, unknown>;
}

export interface ParsedFrontMatter {
    properties: Record<string, unknown>;
}

export interface ParsedSections {
    frontmatter: ParsedFrontMatter;
    codeBlocks: ParsedCodeBlock[];
    contentRanges: [number, number][];
}

export interface ParsedTemplateInfo {
    file: TFile;
    source: string;
    frontmatter: ParsedFrontMatter;
    codeBlocks: ParsedCodeBlock[];
    contentRanges: [number, number][];
}

export class Parser {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async parse(file: TFile) {
        const info = await this.parseFile(file);
        if (!info) {
            throw new PochoirError(`Cannot parse template: ${file.basename}`, {
                notice: false,
            });
        }
        return new Template(info);
    }

    async parseFile(file: TFile): Promise<ParsedTemplateInfo | null> {
        const source = await this.app.vault.cachedRead(file);
        const metadata = this.app.metadataCache.getFileCache(file);
        if (!metadata) return null;

        return {
            file,
            source,
            ...this.parseSections(source, metadata),
        };
    }

    parseSections(source: string, metadata: CachedMetadata): ParsedSections {
        const ret: ParsedSections = {
            frontmatter: {
                properties: {},
            },
            contentRanges: [],
            codeBlocks: [],
        };

        if (!metadata.sections) return ret;

        let start = 0;

        for (const [index, section] of metadata.sections.entries()) {
            if (section.type === "yaml") {
                ret.frontmatter = this.parseFrontmatter(source, section);
                start = section.position.end.offset;
            } else if (section.type === "code") {
                const codeBlock = this.parseCodeBlock(source, section);
                if (codeBlock) {
                    ret.contentRanges.push([
                        start,
                        section.position.start.offset,
                    ]);
                    start =
                        metadata.sections[index + 1]?.position.start.offset ??
                        section.position.end.offset;
                    ret.codeBlocks.push(codeBlock);
                }
            }
        }

        ret.contentRanges.push([start, source.length]);
        return ret;
    }

    parseFrontmatter(source: string, section: SectionCache): ParsedFrontMatter {
        const ret: ParsedFrontMatter = { properties: {} };
        if (section.type !== "yaml") return ret;

        const frontmatter = this.getSectionContent(source, section)
            .replace(/^-{3}|-{3}$/g, "")
            .trim();

        const properties = new PropertiesBuilder();

        const json = parseYaml(frontmatter);

        if (json) {
            for (const [key, value] of Object.entries(json)) {
                properties.set(key, value);
            }
        }

        ret.properties = properties.toObject();

        return ret;
    }

    parseCodeBlock(
        source: string,
        section: SectionCache,
    ): ParsedCodeBlock | undefined {
        if (section.type !== "code") return;
        const content = this.getSectionContent(source, section);

        const regex = /`{3}(\S+)\s*?(\{.*\})\n([\s\S]*?)\n`{3}/;
        const match = content.match(regex);
        if (!match) return;

        const attributes = match[2] ? this.parseAttributes(match[2]) : {};
        if (!attributes.pochoir) return;

        const language = match[1];
        const code = match[3];

        return {
            language,
            section,
            content,
            code,
            attributes,
        };
    }

    parseAttributes(source: string) {
        const pairs = source.replace(/^\{|\}$/g, "").split(/\s/);
        const attributes: Record<string, unknown> = {};

        for (const pair of pairs) {
            let [key, value] = pair.split("=");
            if (value === undefined) {
                attributes[key] = true;
            } else if (/true|false/.test(value)) {
                attributes[key] = Boolean(value);
            } else {
                value = value.replace(/^"|"$/g, "");
                const num = Number(value);
                if (Number.isNaN(num)) {
                    attributes[key] = value;
                } else {
                    attributes[key] = num;
                }
            }
        }

        return attributes;
    }

    getSectionContent(source: string, section: SectionCache) {
        return source.slice(
            section.position.start.offset,
            section.position.end.offset,
        );
    }
}
