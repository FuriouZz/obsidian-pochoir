import type { App, CachedMetadata, SectionCache, TFile } from "obsidian";
import { PropertiesBuilder } from "./properties-builder";
import { Template } from "./template";
import { CodeBlockRegex } from "./utils/processor";

export interface ParsedCodeBlock {
    id: number;
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
    identifier: string;
    displayName: string;
}

export class Parser {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async parse(file: TFile, metadata: CachedMetadata) {
        const source = await this.app.vault.cachedRead(file);
        const info: ParsedTemplateInfo = {
            file,
            source,
            identifier: file.path,
            displayName: file.basename,
            ...this.parseSections(source, metadata),
        };
        return new Template(info);
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
                        codeBlock.id = ret.codeBlocks.length;
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

        const codeBlock = parseCodeBlock(content);
        if (!codeBlock) return;

        return {
            ...codeBlock,
            section,
        };
    }

    getSectionContent(source: string, section: SectionCache) {
        return source.slice(
            section.position.start.offset,
            section.position.end.offset,
        );
    }
}

export function parseCodeBlock(
    content: string,
): Omit<ParsedCodeBlock, "section"> | undefined {
    const match = content.match(CodeBlockRegex);
    if (!match) return;

    const language = match[1];
    if (!language.startsWith("pochoir-")) return;

    const attributes = match[2] ? parseAttributes(match[2]) : {};
    const code = match[3] ?? "";

    return {
        id: 0,
        language,
        content,
        code,
        attributes,
    };
}

export function parseAttributes(source: string) {
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

    return attributes;
}
