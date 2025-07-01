import type { App } from "obsidian";

export function createAsyncFunction(
	code: string,
	...parameters: string[]
): () => Promise<unknown> {
	const ctor = new Function(`return async function(${parameters}) {
        ${code}
    }`);
	return ctor();
}

const LinkPathRegex = /^\[\[(.*)\]\]$/;
export function findLinkPath(app: App, path: string) {
	const match = LinkPathRegex.exec(path);
	if (!match) return;
	return app.metadataCache.getFirstLinkpathDest(match[1], "");
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
