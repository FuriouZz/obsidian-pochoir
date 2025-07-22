import type { App, CachedMetadata, SectionCache, TFile } from "obsidian";
import { PochoirError } from "./errors";
import { PropertiesBuilder } from "./properties-builder";
import { Template } from "./template";
import { CodeBlockRegex } from "./utils/processor";
import { verbose } from "./logger";

export interface ParsedCodeBlock {
    language: string;
    section: SectionCache;
    content: string;
    code: string;
    attributes: Record<string, unknown>;
}

export interface ParsedSections {
    properties: PropertiesBuilder;
    codeBlocks: ParsedCodeBlock[];
    contentRanges: [number, number][];
}

export interface ParsedTemplateInfo extends ParsedSections {
    file: TFile;
    source: string;
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
            properties: new PropertiesBuilder(),
            contentRanges: [],
            codeBlocks: [],
        };

        let contentStart = 0;
        if (metadata.frontmatter) {
            ret.properties.merge(metadata.frontmatter);
        }

        if (metadata.frontmatterPosition) {
            contentStart = metadata.frontmatterPosition.end.offset;
        }

        if (metadata.sections) {
            for (const [index, section] of metadata.sections.entries()) {
                if (section.type === "code") {
                    const codeBlock = this.parseCodeBlock(source, section);
                    if (codeBlock) {
                        ret.contentRanges.push([
                            contentStart,
                            section.position.start.offset,
                        ]);
                        contentStart =
                            metadata.sections[index + 1]?.position.start
                                .offset ?? section.position.end.offset;
                        ret.codeBlocks.push(codeBlock);
                    }
                }
            }

            ret.contentRanges.push([contentStart, source.length]);
        }

        return ret;
    }

    parseCodeBlock(
        source: string,
        section: SectionCache,
    ): ParsedCodeBlock | undefined {
        if (section.type !== "code") return;
        const content = this.getSectionContent(source, section);

        const match = content.match(CodeBlockRegex);
        if (!match) return;

        const language = match[1];
        if (!language.startsWith("pochoir-")) return;

        const attributes = match[2] ? this.parseAttributes(match[2]) : {};
        const code = match[3] ?? "";

        return {
            language,
            section,
            content,
            code,
            attributes,
        };
    }

    parseAttributes(source: string) {
        const attributes: Record<string, unknown> = {};

        let key = "";
        let value = "";
        let escaped = false;
        let target: "key" | "value" = "key";
        let insideQuote = false;

        const close = () => {
            target = "key";

            key = key.trim();
            value = value.trim();

            if (key) {
                if (value.length === 0) {
                    attributes[key] = true;
                } else if (value === "true" || value === "false") {
                    attributes[key] = Boolean(value);
                } else {
                    const num = Number(value);
                    if (Number.isNaN(num)) {
                        attributes[key] = value;
                    } else {
                        attributes[key] = num;
                    }
                }
            }

            key = "";
            value = "";
        };

        let i = 0;
        const len = source.length;
        while (i <= len) {
            const char = source[i];

            if (typeof char === "undefined") {
                close();
            } else if (char === "\\" && !escaped) {
                escaped = true;
            } else if (char === '"' && !escaped) {
                if (insideQuote) {
                    insideQuote = false;
                    close();
                } else {
                    insideQuote = true;
                }
            } else if (char === " " && !insideQuote) {
                close();
            } else if (char === "=") {
                target = "value";
            } else {
                if (target === "key") key += char;
                else if (target === "value") value += char;
                escaped = false;
            }

            i++;
        }

        verbose(source.trim(), attributes);

        return attributes;
    }

    getSectionContent(source: string, section: SectionCache) {
        return source.slice(
            section.position.start.offset,
            section.position.end.offset,
        );
    }
}
