import type { App, CachedMetadata, Loc, SectionCache, TFile } from "obsidian";
import { PropertiesBuilder } from "./properties-builder";
import { Template } from "./template";
import { parseYaml } from "./utils/obsidian";

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

    fromSource(source: string, file: TFile) {
        const metadata = getMetaData(source);
        return new Template({
            file,
            source,
            displayName: "",
            identifier: "",
            ...this.parseSections(source, metadata),
        });
    }
}

// Naive approach to reproduce metadata cache
export function getMetaData(source: string) {
    const lines = source.split("\n");
    const sections: SectionCache[] = [];
    let frontmatter: Record<string, unknown> | undefined;
    let frontmatterPosition: { start: Loc; end: Loc } | undefined;

    if (source.startsWith("---")) {
        const match = source.match(/-{3}\n+((?:.|\n)*)\n+-{3}/);
        if (match) {
            const lines = match[0].split("\n");
            frontmatterPosition = {
                start: {
                    col: 0,
                    line: 0,
                    offset: 0,
                },
                end: {
                    col: lines[lines.length - 1].length,
                    line: lines.length,
                    offset: match[0].length,
                },
            };
            sections.push({ type: "yaml", position: frontmatterPosition });
            frontmatter = parseYaml(match[1]) ?? {};
        }
    }

    const codeBlocks = getCodeBlocks(source);
    sections.push(...codeBlocks.map((c) => c.section));

    sections.sort((a, b) => {
        return a.position.start.offset - b.position.start.offset;
    });

    const tmp = [...sections];

    for (const [index, current] of tmp.entries()) {
        const next = tmp[index + 1];
        const start: Loc = { col: 0, line: 0, offset: 0 };
        const end: Loc = { col: 0, line: 0, offset: 0 };

        if (next) {
            const sublines = lines.slice(
                current.position.end.line,
                next.position.start.line,
            );
            const lastLine = sublines.pop();

            start.col = 0;
            start.line = current.position.end.line + 1;
            start.offset = current.position.end.offset;

            end.col = lastLine?.length ?? 0;
            end.line = next.position.start.line - 1;
            end.offset = next.position.start.offset;
        } else {
            const sublines = lines.slice(current.position.end.line);
            const linecount = sublines.length;
            const lastLine = sublines.pop();

            start.col = 0;
            start.line = current.position.end.line + 1;
            start.offset = current.position.end.offset;

            end.col = lastLine?.length ?? 0;
            end.line = start.line + linecount;
            end.offset = source.length;
        }

        const len = source.slice(start.offset, end.offset).trim().length;
        if (len > 0) {
            sections.push({ type: "text", position: { start, end } });
        }
    }

    sections.sort((a, b) => {
        return a.position.start.offset - b.position.start.offset;
    });

    return { frontmatter, frontmatterPosition, sections, codeBlocks };
}

// Naive approach to parse code blocks
export function getCodeBlocks(source: string) {
    const lines = source.split(/\n/);
    const codeBlockStart = { line: -1, offset: -1 };
    // let codeBlockFence = "";

    const fenceReg = /^`{3,}/;
    const codeFenceReg = /^`{3,}\S+/;

    const sections: SectionCache[] = [];
    let offset = 0;

    for (const [index, line] of lines.entries()) {
        const fenceMatch = line.match(fenceReg);

        if (fenceMatch) {
            if (codeFenceReg.test(line) && codeBlockStart.line === -1) {
                // codeBlockFence = fenceMatch[0];
                codeBlockStart.line = index;
                codeBlockStart.offset = offset;
            } else if (
                !codeFenceReg.test(line)
                //     &&
                // fenceMatch[0] === codeBlockFence
            ) {
                const section: SectionCache = {
                    type: "code",
                    position: {
                        start: {
                            offset: codeBlockStart.offset,
                            col: 0,
                            line: codeBlockStart.line,
                        },
                        end: {
                            offset: offset + line.length,
                            col: line.length,
                            line: index + 1,
                        },
                    },
                };

                sections.push(section);

                // codeBlockFence = "";
                codeBlockStart.line = -1;
                codeBlockStart.offset = -1;
            }
        }
        offset += line.length + 1; // add newline length
    }

    const codeBlocks: ParsedCodeBlock[] = [];

    for (const section of sections) {
        const content = source.slice(
            section.position.start.offset,
            section.position.end.offset,
        );

        const result = parseCodeBlock(content);
        if (!result) continue;

        codeBlocks.push({
            ...result,
            section,
        });
    }

    return codeBlocks;
}

export function parseCodeBlock(
    source: string,
): Omit<ParsedCodeBlock, "section"> | undefined {
    const newline = "\n";

    const firstNewline = source.indexOf(newline) + 1;
    const lastNewline = source.lastIndexOf(newline);

    const code = source.slice(firstNewline, lastNewline);
    const fence = source.slice(lastNewline, source.length).trim();

    const [language, ...attributes] = source
        .slice(fence.length, firstNewline)
        .split(/\s/);

    if (!language.startsWith("pochoir-")) return;

    return {
        id: 0,
        language,
        content: source,
        code,
        attributes: parseAttributes(attributes.join(" ")),
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
