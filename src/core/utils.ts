import type { App } from "obsidian";

export const AsyncFunction = (async () => {})
	.constructor as FunctionConstructor;

export function createAsyncFunction(content: string, ...parameters: string[]) {
	return new AsyncFunction(...parameters, content);
}

const LinkPathRegex = /^\[\[(.*)\]\]$/;
export function findLinkPath(app: App, path: string) {
	const match = LinkPathRegex.exec(path);
	if (!match) return;
	return app.metadataCache.getFirstLinkpathDest(match[1], "");
}
