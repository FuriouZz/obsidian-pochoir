import { type App, type EventRef, Events, TFile } from "obsidian";
import { verbose } from "./logger";
import { parse } from "./parser";
import type { Template } from "./template";
import { alertWrap } from "./utils/alert";
import {
    findLinkPath,
    getFilesAtLocation,
    LinkPathRegex,
} from "./utils/obsidian";

export class Cache extends Events {
    app: App;
    templates = new Map<string, Template>();
    #templateFolder: string | undefined;

    declare on: (
        name: "template-changed",
        callback: (template: Template) => unknown,
        ctx?: unknown,
    ) => EventRef;

    constructor(app: App) {
        super();
        this.app = app;
    }

    get templateFolder() {
        return this.#templateFolder;
    }

    set templateFolder(path: string | undefined) {
        this.#templateFolder = path;
        this.refresh();
    }

    getFiles() {
        return getFilesAtLocation(this.app, this.#templateFolder ?? "/");
    }

    async refresh() {
        this.templates.clear();
        return Promise.all(
            this.getFiles().map((file) => this.invalidate(file)),
        );
    }

    async invalidate(file: TFile) {
        if (file.parent?.path !== this.#templateFolder) return;
        this.templates.delete(file.path);
        verbose("parse", file.path);
        const template = await alertWrap(() => parse(this.app, file));
        if (template) {
            this.templates.set(template.info.file.path, template);
            this.trigger("template-changed", template);
            this.on;
        }
        return template;
    }

    resolve(path: string | TFile) {
        let file: TFile | null = null;
        if (path instanceof TFile) {
            file = path;
        } else {
            file = LinkPathRegex.test(path)
                ? findLinkPath(this.app, path)
                : this.app.vault.getFileByPath(path);
        }
        if (!file) throw new Error(`File does not exist: ${path}`);

        const template = this.templates.get(file.path);
        if (!template) throw new Error(`Template does not exist: ${path}`);

        return template;
    }
}
