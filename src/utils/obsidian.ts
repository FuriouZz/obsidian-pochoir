import {
    parseYaml as _parseYaml,
    type App,
    Component,
    MarkdownRenderer,
    MarkdownView,
    normalizePath,
    type Plugin,
    TFile,
    TFolder,
    Vault,
} from "obsidian";
import { LOGGER } from "../logger";

export const WikiLinkPathRegex = /^\[\[(.*)\]\]$/;
export const SnippetRegex = /^snippet\((.*)\)$/;

export function findLinkPath(app: App, path: string) {
    const match = WikiLinkPathRegex.exec(path);
    if (!match) return null;
    return app.metadataCache.getFirstLinkpathDest(match[1], "");
}

export function parentFolderPath(path: string) {
    return path.replace(/\/?[^/]*$/, "") || "/";
}

export function getNewFileLocation(app: App, filename: string) {
    return app.fileManager.getNewFileParent(filename);
}

export function getFilesAtLocation(app: App, location: string) {
    const files: TFile[] = [];
    const folder = app.vault.getFolderByPath(location);
    if (!folder) return files;
    Vault.recurseChildren(folder, (item) => {
        if (item instanceof TFile) files.push(item);
    });
    return files;
}

export async function findOrCreateFolder(
    app: App,
    path: string,
): Promise<TFolder> {
    const folder = app.vault.getAbstractFileByPath(path);
    if (folder instanceof TFolder) {
        return folder;
    }
    return await app.vault.createFolder(path);
}

export function findNote(app: App, path: string) {
    const file = app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) return file;
    return null;
}

export async function findOrCreateNote(app: App, path: string) {
    const file = app.vault.getAbstractFileByPath(path);

    if (file instanceof TFile) {
        return file;
    } else if (file instanceof TFolder) {
        throw new Error(`There is already a folder: ${file.path}`);
    }

    const [base, ...chunks] = path.split("/").reverse();
    const folder = chunks.reverse().join("/");
    path = await ensurePath(app, base, folder);
    return app.vault.create(path, "");
}

export async function createNote(app: App, filename: string, folder?: TFolder) {
    const location = folder ?? getNewFileLocation(app, filename);
    const path = app.vault.getAvailablePath(
        normalizePath(`${location.path}/${filename}`),
        "md",
    );
    return app.vault.create(path, "");
}

export async function ensurePath(app: App, path: string, baseDir?: string) {
    const [base, ...chunks] = path.split("/").reverse();
    baseDir = baseDir ?? chunks.reverse().join("/");
    const folder = await findOrCreateFolder(app, baseDir);
    const [name, ext] = base.split(".");
    return app.vault.getAvailablePath(`${folder.path}/${name}`, ext);
}

export function parseYaml<T = unknown>(str: string) {
    if (!str) return null;
    return _parseYaml(str) as T;
}

export function tryParseYaml<T = unknown>(str: string) {
    if (!str) return null;
    try {
        return parseYaml<T>(str);
    } catch (e) {
        LOGGER.error(e);
    }
    return null;
}

export function createMarkdownRenderer(plugin: Plugin) {
    return async (
        content: string,
        el: HTMLElement = globalThis.document.createElement("div"),
    ) => {
        const c = new Component();
        await MarkdownRenderer.render(plugin.app, content, el, "", c);
        return el;
    };
}

const CursorReg = /\[\^\]/;
export function placeCursorInRange(app: App, from: number) {
    const view = app.workspace.getActiveViewOfType(MarkdownView);

    // Place cursor
    if (view) {
        for (let i = from; i < view.editor.lineCount(); i++) {
            const match = view.editor.getLine(i).match(CursorReg);
            if (match) {
                view.editor.setCursor({
                    line: i,
                    ch: match.index ?? 0,
                });
                view.editor.replaceRange(
                    "",
                    {
                        line: i,
                        ch: match.index ?? 0,
                    },
                    {
                        line: i,
                        ch: (match.index ?? 0) + 3,
                    },
                );
            }
        }
    }
}
