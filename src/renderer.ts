import type { App } from "obsidian";
import type { Environment, Loader } from "ventojs/src/environment.js";
import { RendererError } from "./errors";
import type { Template } from "./template";
import { findLinkPath } from "./utils/obsidian";
import { vento } from "./vento";

interface TemplateLoaderOptions {
    findTemplate: (path: string) => Template | null;
}

class TemplateLoader implements Loader {
    app: App;
    options: TemplateLoaderOptions;

    constructor(app: App, options: TemplateLoaderOptions) {
        this.app = app;
        this.options = options;
    }

    async load(path: string) {
        const template = this.options.findTemplate(path);
        return { source: template?.getContent() ?? "" };
    }

    resolve(_from: string, path: string) {
        const file = findLinkPath(this.app, path);
        if (!file) throw new RendererError("File does not exist");
        return file.path;
    }
}

export class Renderer {
    vento: Environment;

    constructor(app: App, options: TemplateLoaderOptions) {
        this.vento = vento({
            dataVarname: "exports",
            autoDataVarname: true,
            loader: new TemplateLoader(app, options),
        });
    }

    async render(
        content: string,
        data: Record<string, unknown>,
        path?: string,
    ) {
        try {
            const result = await this.vento.runString(content, data, path);
            return result.content as string;
        } catch (e) {
            const error = (e as Error).cause as Error;
            throw new RendererError(error.message);
        }
    }
}
