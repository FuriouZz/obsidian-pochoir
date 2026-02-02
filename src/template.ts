import type { TFile } from "obsidian";
import { Content } from "./content";
import type { Environment } from "./environment";
import type { ParsedTemplateInfo } from "./parser";
import type {
    CodeBlockProcessor,
    GenericProcessor,
    PropertyProcessor,
} from "./processor-list";
import type { TemplateContext } from "./template-context";

export class Template {
    info: ParsedTemplateInfo;
    content: Content;

    constructor(info: ParsedTemplateInfo) {
        this.info = info;
        this.content = new Content();
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
        return this.content.render(this);
    }

    async preprocess(env: Environment) {
        for (const processor of env.processors) {
            if (!processor.preprocess) continue;
            processor.cleanupPreprocess?.({ template: this });
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
                continue;
            }
            const isValid =
                codeBlock.language in processor.languages &&
                testProcessor(processor, codeBlock.language, {
                    template: this,
                    codeBlock,
                });
            if (isValid) {
                await Promise.resolve(
                    processor.preprocess?.({
                        codeBlock,
                        template: this,
                    }),
                );
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
                await Promise.resolve(
                    processor.preprocess?.({ key, value, template: this }),
                );
            }
        }
    }

    async process(env: Environment, context: TemplateContext) {
        for (const p of env.contextProviders) {
            await Promise.resolve(p(context, this));
        }

        if (this.isSnippet()) return;

        context.properties.merge(this.info.properties);

        for (const processor of env.processors) {
            if (!processor.process) continue;
            processor.cleanupProcess?.({ template: this });
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
                await Promise.resolve(
                    processor.process?.({
                        context,
                        codeBlock,
                        template: this,
                    }),
                );
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
                await Promise.resolve(
                    processor.process?.({
                        context,
                        key,
                        value,
                        template: this,
                    }),
                );
            }
        }
    }

    async render(env: Environment, context: TemplateContext, target: TFile) {
        const contentProcessor = context.get("content");

        // Update file content
        if (contentProcessor) {
            await env.app.vault.process(target, (content) => {
                return contentProcessor.processTarget(content) ?? content;
            });
        }

        // Transfer properties
        const properties = await context.transferProps(env.app, target);

        // Update template content
        const templateContent = contentProcessor
            ? contentProcessor.processTemplate(this.getContent())
            : this.getContent();

        // Render content
        return env.renderer.render(templateContent, {
            ...context.exports,
            properties,
        });
    }
}

function testProcessor<TParams, TProcessor extends GenericProcessor<TParams>>(
    processor: TProcessor,
    key: string,
    params: TParams,
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
