import type { ParsedCodeBlock } from "parser";
import type { Template, TemplateContext } from "./template";

export interface AbstractProcessor<
    TType extends "property" | "codeblock" = "property",
    TParams extends object = object,
> {
    type: TType;
    order?: number;
    test?: string | RegExp | ((params: TParams) => boolean);
    process: (params: TParams) => Promise<void>;
    disable?: (params: TParams) => void;
}

export type PropertyProcessor = AbstractProcessor<
    "property",
    {
        context: TemplateContext;
        template: Template;
        key: string;
        value: unknown;
    }
>;

export type CodeBlockProcessor = AbstractProcessor<
    "codeblock",
    { context: TemplateContext; template: Template; codeBlock: ParsedCodeBlock }
>;

export type PropertyPreprocessor = PropertyProcessor extends AbstractProcessor<
    infer V,
    infer U
>
    ? AbstractProcessor<V, Omit<U, "context">>
    : never;

export type CodeBlockPreprocessor =
    CodeBlockProcessor extends AbstractProcessor<infer V, infer U>
        ? AbstractProcessor<V, Omit<U, "context">>
        : never;

export type Processor = PropertyProcessor | CodeBlockProcessor;
export type Preprocessor = PropertyPreprocessor | CodeBlockPreprocessor;

export class ProcessorList<T extends Processor | Preprocessor> {
    #entries = new Map<string, T & { name: string; order: number }>();
    order: string[] = [];

    set(name: string, processor: T) {
        this.#entries.set(name, {
            name,
            order: 0,
            ...processor,
        });
        if (!this.order.includes(name)) {
            this.order.push(name);
        }
        this.sort();
        return this;
    }

    delete(name: string) {
        this.#entries.delete(name);
        const index = this.order.indexOf(name);
        if (index > -1) this.order.splice(index, 1);
        return this;
    }

    clear() {
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
