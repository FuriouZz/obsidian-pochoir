import type { ParsedCodeBlock } from "./parser";
import type { Template, TemplateContext } from "./template";

interface CodeBlockParams {
    template: Template;
    codeBlock: ParsedCodeBlock;
}

interface CodeBlockProcessorWithParams<TParams> {
    type: "codeblock";
    languages: Record<string, "javascript" | "yaml">;
    test?: string | RegExp | ((params: TParams) => boolean);
    order?: number;
    process: (params: TParams) => Promise<void>;
    disable?: (params: TParams) => void;
    dispose?: () => void;
    suggestions?: {
        suggestion: string;
        novar?: boolean;
        trigger?: string;
        display?: string;
    }[];
}

export type CodeBlockPreprocessor =
    CodeBlockProcessorWithParams<CodeBlockParams>;
export type CodeBlockProcessor = CodeBlockProcessorWithParams<
    WithContext<CodeBlockParams>
>;

interface PropertyParams {
    template: Template;
    key: string;
    value: unknown;
}

interface PropertyProcessorWithParams<TParams> {
    type: "property";
    order?: number;
    test?: string | RegExp | ((params: TParams) => boolean);
    process: (params: TParams) => Promise<void>;
    disable?: (params: TParams) => void;
    dispose?: () => void;
}

export type PropertyPreprocessor = PropertyProcessorWithParams<PropertyParams>;
export type PropertyProcessor = PropertyProcessorWithParams<
    WithContext<PropertyParams>
>;

type WithContext<T> = T & { context: TemplateContext };

export type Processor = PropertyProcessor | CodeBlockProcessor;
export type Preprocessor = PropertyPreprocessor | CodeBlockPreprocessor;

export class ProcessorList<T extends Processor | Preprocessor> {
    #entries = new Map<string, T & { id: string; order: number }>();
    order: string[] = [];

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
        this.#entries.set(id, {
            id,
            order: 0,
            ...processor,
        });
        if (!this.order.includes(id)) {
            this.order.push(id);
        }
        this.sort();
        return this;
    }

    delete(id: string) {
        this.#entries.delete(id);
        const index = this.order.indexOf(id);
        if (index > -1) this.order.splice(index, 1);
        return this;
    }

    clear() {
        for (const p of this.#entries) p[1].dispose?.();
        this.#entries.clear();
        this.order.length = 0;
        return this;
    }

    sort() {
        this.order.sort((na, nb) => {
            const a = this.#entries.get(na)?.order ?? 0;
            const b = this.#entries.get(nb)?.order ?? 0;
            return a - b;
        });
        return this;
    }

    reorder(order: Record<string, number>) {
        for (const [key, value] of Object.entries(order)) {
            const entry = this.#entries.get(key);
            if (entry) entry.order = value;
        }
        this.sort();
        return this;
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
