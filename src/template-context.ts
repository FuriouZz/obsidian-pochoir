/** biome-ignore-all lint/style/noNonNullAssertion: idk */
import type { App, TFile } from "obsidian";
import { verbose } from "./logger";
import { PathBuilder } from "./path-builder";
import { PropertiesBuilder } from "./properties-builder";
import type { Template } from "./template";

export interface TemplateContextLocals {
    $properties: PropertiesBuilder;
    properties: ReturnType<PropertiesBuilder["createProxy"]>;
    path: PathBuilder;
    exports: Record<string, unknown>;
}

export type TemplateContextProvider = (
    context: TemplateContext,
    template: Template,
) => void | Promise<void>;

let ID = 0;
export class TemplateContext {
    #locals: Partial<TemplateContextLocals> = {};
    id = ++ID;

    constructor() {
        const properties = new PropertiesBuilder();
        const path = new PathBuilder();

        this.set("path", path);
        this.set("$properties", properties);
        this.set("properties", properties.createProxy());
        this.set("exports", {});

        verbose("create context", this.id);
    }

    get properties() {
        return this.#locals.$properties!;
    }

    get path() {
        return this.#locals.path!;
    }

    get exports() {
        return this.#locals.exports!;
    }

    get locals() {
        return this.#locals;
    }

    get<K extends keyof TemplateContextLocals>(
        key: K,
    ): TemplateContextLocals[K] | undefined {
        return this.#locals[key];
    }

    set<K extends keyof TemplateContextLocals>(
        key: K,
        value: TemplateContextLocals[K] | undefined,
    ) {
        this.#locals[key] = value;
        return this;
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
