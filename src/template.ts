import {
  parseYaml,
  type App,
  type FrontMatterCache,
  type SectionCache,
  type TFile,
} from "obsidian";
import { getSectionContent } from "./parser";
import { PropertiesBuilder } from "./properties_builder";
import { TemplateEngine } from "./template_engine";

export interface TemplateInfo {
  file: TFile;
  source: string;
  frontmatter?: SectionCache;
  codeBlocks: TemplateCodeBlock[];
  sections: SectionCache[];
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

  getPropertiesContent() {
    if (!this.info.frontmatter) return;
    return getSectionContent(this.info.source, this.info.frontmatter)
      .replace(/^-{3}|-{3}$/g, "")
      .trim();
  }

  getContent() {
    const { sections: contentSections, source } = this.info;
    if (contentSections.length === 0) return "";

    const content = [];

    for (const section of contentSections) {
      content.push(getSectionContent(source, section));
    }

    return content.join("\n");
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
    const content = this.getPropertiesContent();
    if (!content) return {};
    const str = await engine.renderString(content, context.locals.exports);
    context.locals.$properties.fromYaml(str);
  }

  async mergeProperties(context: TemplateContext, file: TFile, app: App) {
    const builder = new PropertiesBuilder();
    await app.fileManager.processFrontMatter(file, (fm) => {
      builder.fromObject({ ...fm });
      builder.fromObject(context.locals.$properties.toObject());
      builder.toFrontmatter(fm);
    });
    return builder.toObject();
  }
}
