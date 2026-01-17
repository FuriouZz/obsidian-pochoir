import type { ParsedCodeBlock } from "./parser";
import type { Template, TemplateContext } from "./template";
import { Queue } from "./utils/Queue";

export interface CodeBlockParams {
    template: Template;
    codeBlock: ParsedCodeBlock;
}

export interface PropertyParams {
    template: Template;
    key: string;
    value: unknown;
}

export type WithContext<T> = T & { context: TemplateContext };
export type WithOptionalContext<T> = T & { context?: TemplateContext };

export type GenericProcessor<TParams> = {
    test?: string | RegExp | ((params: TParams) => boolean);
    preprocess?: (params: TParams) => Promise<void> | void;
    process?: (params: WithContext<TParams>) => Promise<void> | void;
    disable?: (params: WithOptionalContext<TParams>) => void;
    dispose?: () => void;
};

export type CodeBlockProcessor = GenericProcessor<CodeBlockParams> & {
    type: "codeblock";
    languages: Record<string, "javascript" | "yaml" | "md">;
    suggestions?: {
        suggestion: string;
        novar?: boolean;
        trigger?: string;
        display?: string;
    }[];
};

export type PropertyProcessor = GenericProcessor<PropertyParams> & {
    type: "property";
};

export type Processor = PropertyProcessor | CodeBlockProcessor;

export class ProcessorList<T extends Processor> {
    #entries = new Map<string, T & { id: string }>();
    order = new Queue<string>();

    getSupportedCodeBlock(languages: CodeBlockProcessor["languages"] = {}) {
        for (const processor of this.values()) {
            if (processor.type === "codeblock") {
                Object.assign(languages, processor.languages);
            }
        }
        return languages;
    }

    getSuggestions(
        suggestions: Record<
            string,
            Required<CodeBlockProcessor>["suggestions"]
        > = {},
    ) {
        for (const processor of this.values()) {
            if (processor.type === "codeblock" && processor.suggestions) {
                const entries = Object.keys(processor.languages).map(
                    (key) => [key, processor.suggestions] as const,
                );
                Object.assign(suggestions, Object.fromEntries(entries));
            }
        }
        return suggestions;
    }

    set(id: string, processor: T) {
        this.#entries.set(id, { id, ...processor });
        this.order.add(id);
        return this;
    }

    delete(id: string) {
        this.#entries.delete(id);
        this.order.delete(id);
        return this;
    }

    clear() {
        for (const p of this.#entries) p[1].dispose?.();
        this.#entries.clear();
        this.order.clear();
        return this;
    }

    sort(order: Record<string, number> | string[]) {
        const _order: [string, number][] = Array.isArray(order)
            ? order.map((order, index) => [order, index] as const)
            : Object.entries(order);

        this.order.reorder(_order);
        return this;
    }

    fromLanguage(language: string): CodeBlockProcessor | null {
        for (const processor of this) {
            if (processor.type === "property") continue;
            if (language in processor.languages) {
                return processor;
            }
        }
        return null;
    }

    [Symbol.iterator]() {
        return this.values();
    }

    *values() {
        for (const name of this.order) {
            const value = this.#entries.get(name);
            if (value) yield value;
        }
    }
}
