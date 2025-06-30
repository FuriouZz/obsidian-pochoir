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
