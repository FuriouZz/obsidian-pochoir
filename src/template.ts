import { verbose } from "logger";
import type { App, TFile } from "obsidian";
import type { Environment } from "./environment";
import type { ParsedTemplateInfo } from "./parser";
import { PathBuilder } from "./path-builder";
import type { CodeBlockProcessor, PropertyProcessor } from "./processor-list";
import { PropertiesBuilder } from "./properties-builder";

export interface TemplateContextLocals {
    $properties: PropertiesBuilder;
    properties: ReturnType<PropertiesBuilder["createProxy"]>;
    path: PathBuilder;
    exports: Record<string, unknown>;
}

let ID = 0;
export class TemplateContext {
    target: TFile;
    properties: PropertiesBuilder;
    path: PathBuilder;
    locals: TemplateContextLocals;
    id = ++ID;

    constructor(target: TFile) {
        this.target = target;
        this.properties = new PropertiesBuilder();
        this.path = new PathBuilder();
        this.path.fromTFile(target);

        this.locals = Object.freeze({
            properties: this.properties.createProxy(),
            $properties: this.properties,
            path: this.path,
            target: this.target,
            exports: {},
        });

        verbose("create context", this.id);
    }

    async load(template: Template, env: Environment) {
        for (const p of env.contextProviders) {
            await Promise.resolve(p(this, template));
        }

        this.properties.merge(template.info.frontmatter.properties);

        for (const processor of env.processors) {
            if (processor.type === "codeblock") {
                await template.processCodeBlock(this, processor);
            } else if (processor.type === "property") {
                await template.processProperty(this, processor);
            }
        }
    }

    async transferProps(app: App) {
        const builder = new PropertiesBuilder();
        await app.fileManager.processFrontMatter(this.target, (fm) => {
            builder.merge(fm);
            builder.merge(this.properties.toObject());
            builder.toObject(fm);
        });
        return builder.toObject();
    }
}

export class Template {
    info: ParsedTemplateInfo;

    constructor(info: ParsedTemplateInfo) {
        this.info = info;
    }

    getContent() {
        const { source } = this.info;

        return this.info.contentRanges
            .map((range) => source.slice(...range))
            .join("")
            .trim();
    }

    async processCodeBlock(
        context: TemplateContext,
        processor: CodeBlockProcessor,
    ) {
        for (const codeBlock of this.info.codeBlocks) {
            if (codeBlock.attributes.disabled) continue;
            const isValid = testProcessor(processor, codeBlock.language, {
                context,
                codeBlock,
            });
            if (isValid) {
                await processor.process({ context, codeBlock });
            }
        }
    }

    async processProperty(
        context: TemplateContext,
        processor: PropertyProcessor,
    ) {
        for (const [key, value] of context.properties.entries()) {
            const isValid = testProcessor(processor, key, {
                context,
                key,
                value,
            });
            if (isValid) {
                await processor.process({ context, key, value });
            }
        }
    }
}

function testProcessor<Params extends { context: TemplateContext }>(
    processor: {
        test?: string | RegExp | ((params: Params) => boolean);
    },
    key: string,
    params: Params,
) {
    let isValid = !processor.test;
    if (typeof processor.test === "string") {
        isValid = processor.test === key;
    } else if (processor.test instanceof RegExp) {
        isValid = processor.test.test(key);
    } else if (typeof processor.test === "function") {
        isValid = processor.test(params);
    }
    return isValid;
}
