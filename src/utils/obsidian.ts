import {
    parseYaml as _parseYaml,
    type App,
    Component,
    MarkdownRenderer,
    normalizePath,
    TFile,
    TFolder,
    Vault,
} from "obsidian";

export const LinkPathRegex = /^\[\[(.*)\]\]$/;

export function findLinkPath(app: App, path: string) {
    const match = LinkPathRegex.exec(path);
    if (!match) return null;
    return app.metadataCache.getFirstLinkpathDest(match[1], "");
}

export function parentFolderPath(path: string) {
    return path.replace(/\/?[^/]*$/, "") || "/";
}

export function getNewFileLocation(app: App) {
    switch (app.vault.getConfig("newFileLocation")) {
        case "folder": {
            return app.fileManager.getNewFileParent("");
        }
        case "current": {
            const folder = app.workspace.getActiveFile()?.parent;
            return folder ?? app.vault.getRoot();
        }
        default: {
            return app.vault.getRoot();
        }
    }
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

export async function findOrCreateFolder(app: App, path: string) {
    let folder = app.vault.getAbstractFileByPath(path);
    if (folder instanceof TFile) {
        throw new Error(`There is already a file: ${folder.path}`);
    }
    if (!folder) {
        folder = await app.vault.createFolder(path);
    }
    return folder;
}

export async function findOrCreateNote(app: App, path: string) {
    const file = app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) return file;
    if (file instanceof TFolder) {
        throw new Error(`There is already a folder: ${file.path}`);
    }
    const folder = parentFolderPath(path);
    if (folder) await findOrCreateFolder(app, folder);
    return app.vault.create(path, "");
}

export async function createNote(app: App, filename: string, folder?: TFolder) {
    const location = folder ?? getNewFileLocation(app);
    const path = app.vault.getAvailablePath(
        normalizePath(`${location.path}/${filename}`),
        "md",
    );
    return findOrCreateNote(app, path);
}

export async function ensurePath(app: App, filename: string, folder = "") {
    if (folder) await findOrCreateFolder(app, folder);
    const [basename, extension] = filename.split(".");
    return app.vault.getAvailablePath(
        folder ? `${folder}/${basename}` : basename,
        extension,
    );
}

export function parseYaml<T = unknown>(str: string) {
    if (!str) return null;
    return _parseYaml(str) as T;
}

export function createMarkdownRenderer(app: App) {
    return async (
        content: string,
        el: HTMLElement = document.createElement("div"),
    ) => {
        const component = new Component();
        await MarkdownRenderer.render(app, content, el, "", component);
        return el;
    };
}
