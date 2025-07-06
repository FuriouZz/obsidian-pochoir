import type { App, FrontMatterCache, SectionCache, TFile } from "obsidian";
import { getSectionContent } from "./parser";
import { PropertiesBuilder } from "./properties_builder";
import type { TemplateEngine } from "./template_engine";

export interface TemplateInfo {
  file: TFile;
  source: string;
  frontmatter?: SectionCache;
  codeBlocks: TemplateCodeBlock[];
  contents: [number, number][];
}

export interface TemplateCodeBlock {
  language: string;
  section: SectionCache;
  content: string;
  code: string;
  attributes: Record<string, unknown>;
}

export type FrontmatterProcessor = (params: {
  context: TemplateContext;
  frontmatter: FrontMatterCache;
}) => void | Promise<void>;

export type CodeBlockProcessor = (params: {
  context: TemplateContext;
  codeBlock: TemplateCodeBlock;
}) => boolean | Promise<boolean>;

export type VariablesProvider = (context: TemplateContext) => void;

export class TemplateContext {
  globals: Record<string, unknown>;
  locals: {
    $properties: PropertiesBuilder;
    properties: ReturnType<PropertiesBuilder["createProxy"]>;
    exports: Record<string, unknown>;
  };

  constructor() {
    const $properties = new PropertiesBuilder();
    const properties = $properties.createProxy();
    this.globals = {};
    this.locals = Object.freeze({ properties, $properties, exports: {} });
  }
}

export class Template {
  constructor(public info: TemplateInfo) {}

  getFrontmatter() {
    if (!this.info.frontmatter) return;
    return getSectionContent(this.info.source, this.info.frontmatter)
      .replace(/^-{3}|-{3}$/g, "")
      .trim();
  }

  getContent() {
    const { source } = this.info;
    return this.info.contents
      .map((range) => source.slice(...range))
      .join("")
      .trim();
  }

  async evaluateCodeBlocks(
    context: TemplateContext,
    processors: CodeBlockProcessor[],
  ) {
    for (const codeBlock of this.info.codeBlocks) {
      for (const processor of processors) {
        const promise = processor({ context, codeBlock });
        const res = await Promise.resolve(promise);
        if (res) break;
      }
    }
  }

  async evaluateProperties(context: TemplateContext, engine: TemplateEngine) {
    const frontmatter = this.getFrontmatter();
    if (!frontmatter) return {};
    const str = await engine.renderString(frontmatter, context.locals.exports);
    context.locals.$properties.fromYaml(str);
  }

  async mergeProperties(context: TemplateContext, file: TFile, app: App) {
    const builder = new PropertiesBuilder();
    await app.fileManager.processFrontMatter(file, (fm) => {
      builder.fromObject(fm);
      builder.fromObject(context.locals.$properties.toObject());
      builder.toFrontmatter(fm);
    });
    return builder.toObject();
  }
}
