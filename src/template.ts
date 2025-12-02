import type { App, TFile } from "obsidian";
import type { Environment } from "./environment";
import { verbose } from "./logger";
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
    properties: PropertiesBuilder;
    path: PathBuilder;
    locals: TemplateContextLocals;
    id = ++ID;

    constructor() {
        this.properties = new PropertiesBuilder();
        this.path = new PathBuilder();
        // this.path.name = "Untitled.md";

        this.locals = Object.freeze({
            properties: this.properties.createProxy(),
            $properties: this.properties,
            path: this.path,
            exports: {},
        });

        verbose("create context", this.id);
    }

    async transferProps(app: App, target: TFile) {
        const builder = new PropertiesBuilder();
        await app.fileManager.processFrontMatter(
            target,
            (fm: Record<string, unknown>) => {
                builder.merge(fm);
                builder.merge(this.properties);
                builder.toObject(fm);
            },
        );
        return builder.toObject();
    }
}

export class Template {
    info: ParsedTemplateInfo;

    constructor(info: ParsedTemplateInfo) {
        this.info = info;
    }

    getDisplayName() {
        return this.info.displayName;
    }

    getIdentifier() {
        return this.info.identifier;
    }

    isSnippet() {
        return this.info.identifier.contains("#");
    }

    getContent() {
        const { source } = this.info;

        return this.info.contentRanges
            .map((range) => source.slice(...range))
            .join("")
            .trim();
    }

    async preprocess(env: Environment) {
        for (const processor of env.processors) {
            if (!processor.preprocess) continue;
            processor.beforePreprocess?.({ template: this });
            if (processor.type === "codeblock") {
                await this.preprocessCodeBlock(processor);
            } else if (processor.type === "property") {
                await this.preprocessProperty(processor);
            }
        }
    }

    async preprocessCodeBlock(processor: CodeBlockProcessor) {
        for (const codeBlock of this.info.codeBlocks) {
            if (codeBlock.attributes.disabled) {
                processor.disable?.({ codeBlock, template: this });
                continue;
            }
            const isValid =
                codeBlock.language in processor.languages &&
                testProcessor(processor, codeBlock.language, {
                    template: this,
                    codeBlock,
                });
            if (isValid) {
                await processor.preprocess?.({ codeBlock, template: this });
            }
        }
    }

    async preprocessProperty(processor: PropertyProcessor) {
        for (const [key, value] of this.info.properties.entries()) {
            const isValid = testProcessor(processor, key, {
                template: this,
                key,
                value,
            });
            if (isValid) {
                await processor.preprocess?.({ key, value, template: this });
            }
        }
    }

    async process(env: Environment, context: TemplateContext) {
        for (const p of env.contextProviders) {
            await Promise.resolve(p(context, this));
        }

        context.properties.merge(this.info.properties);

        for (const processor of env.processors) {
            if (!processor.process) continue;
            processor.beforeProcess?.({ template: this });
            if (processor.type === "codeblock") {
                await this.processCodeBlock(context, processor);
            } else if (processor.type === "property") {
                await this.processProperty(context, processor);
            }
        }
    }

    async processCodeBlock(
        context: TemplateContext,
        processor: CodeBlockProcessor,
    ) {
        for (const codeBlock of this.info.codeBlocks) {
            if (codeBlock.attributes.disabled) {
                processor.disable?.({ context, codeBlock, template: this });
                continue;
            }
            const isValid =
                codeBlock.language in processor.languages &&
                testProcessor(processor, codeBlock.language, {
                    context,
                    template: this,
                    codeBlock,
                });
            if (isValid) {
                await processor.process?.({
                    context,
                    codeBlock,
                    template: this,
                });
            }
        }
    }

    async processProperty(
        context: TemplateContext,
        processor: PropertyProcessor,
    ) {
        for (const [key, value] of context.properties.entries()) {
            const isValid = testProcessor(processor, key, {
                template: this,
                context,
                key,
                value,
            });
            if (isValid) {
                await processor.process?.({
                    context,
                    key,
                    value,
                    template: this,
                });
            }
        }
    }
}

function testProcessor<Params>(
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
