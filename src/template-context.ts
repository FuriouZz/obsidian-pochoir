import type { App, TFile } from "obsidian";
import { ContentProcessor } from "./content-processor";
import { verbose } from "./logger";
import { PathBuilder } from "./path-builder";
import { PropertiesBuilder } from "./properties-builder";
import type { Template } from "./template";

export interface TemplateContextLocals {
    $properties: PropertiesBuilder;
    properties: ReturnType<PropertiesBuilder["createProxy"]>;
    path: PathBuilder;
    exports: Record<string, unknown>;
    content: ContentProcessor;
}

export type TemplateContextProvider = (
    context: TemplateContext,
    template: Template,
) => void | Promise<void>;

let ID = 0;
export class TemplateContext {
    locals: TemplateContextLocals;
    id = ++ID;

    constructor() {
        const properties = new PropertiesBuilder();
        const path = new PathBuilder();
        const content = new ContentProcessor();

        this.locals = Object.freeze({
            properties: properties.createProxy(),
            $properties: properties,
            path: path,
            content: content,
            exports: {},
        });

        verbose("create context", this.id);
    }

    get properties() {
        return this.locals.$properties;
    }

    get path() {
        return this.locals.path;
    }

    get content() {
        return this.locals.content;
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
