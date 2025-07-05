import type { App, CachedMetadata, SectionCache, TFile } from "obsidian";
import {
  Template,
  type TemplateCodeBlock,
  type TemplateInfo,
} from "./template";

export class Parser {
  cache = new Map<string, TemplateInfo>();

  async parse({ app, file }: { app: App; file: TFile }) {
    const info = await this.parseFile(app, file);
    if (!info) throw new Error(`Cannot parse template: ${file.basename}`);
    return new Template(info);
  }

  async parseFile(app: App, file: TFile) {
    const result = this.cache.get(file.path);
    if (result) return result;

    const source = await app.vault.cachedRead(file);
    const metadata = app.metadataCache.getFileCache(file);
    if (!metadata) return null;

    const res = this.parseSections(source, metadata);
    if (!res) return null;

    const info: TemplateInfo = { file, source, ...res };

    this.cache.set(file.path, info);

    return info;
  }

  parseSections(source: string, metadata: CachedMetadata) {
    if (!metadata.sections) return;

    let frontmatter: SectionCache | undefined;
    const sections: SectionCache[] = [];
    const codeBlocks: TemplateCodeBlock[] = [];
    for (const section of metadata.sections) {
      if (section.type === "yaml") {
        frontmatter = section;
        continue;
      }
      if (section.type === "code") {
        const codeBlock = this.parseCodeBlock(source, section);
        if (codeBlock) {
          codeBlocks.push(codeBlock);
          continue;
        }
      }
      sections.push(section);
    }

    return { frontmatter, sections, codeBlocks };
  }

  parseCodeBlock(
    source: string,
    section: SectionCache,
  ): TemplateCodeBlock | undefined {
    if (section.type !== "code") return;
    const content = getSectionContent(source, section);

    const regex = /`{3}(\S+)\s*(\{.*\})?\n([\s\S]*?)\n`{3}/;
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
      const [key, value] = pair.split("=");
      if (value === undefined) {
        attributes[key] = true;
      } else if (/true|false/.test(value)) {
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

    return attributes;
  }
}

export function getSectionContent(source: string, section: SectionCache) {
  return source.slice(
    section.position.start.offset,
    section.position.end.offset,
  );
}
