import type { ParsedCodeBlock } from "./parser";
import type { TemplateContext } from "./template";

export type PropertyProcessor = {
    type: "property";
    test?:
        | string
        | RegExp
        | ((params: {
              context: TemplateContext;
              key: string;
              value: unknown;
          }) => boolean);
    process: (params: {
        context: TemplateContext;
        key: string;
        value: unknown;
    }) => Promise<void>;
};

export type CodeBlockProcessor = {
    type: "codeblock";
    test?:
        | string
        | RegExp
        | ((params: {
              context: TemplateContext;
              codeBlock: ParsedCodeBlock;
          }) => boolean);
    process: (params: {
        context: TemplateContext;
        codeBlock: ParsedCodeBlock;
    }) => Promise<void>;
};

export type UserProcessor = (PropertyProcessor | CodeBlockProcessor) & {
    order?: number;
};

export type Processor = UserProcessor & {
    name: string;
};

export class ProcessorList {
    #entries = new Map<string, Processor>();
    order: string[] = [];

    set(name: string, processor: UserProcessor) {
        const value = {
            name,
            order: 0,
            test: undefined,
            ...processor,
        };
        this.#entries.set(name, value);
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
