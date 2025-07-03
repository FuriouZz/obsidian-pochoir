import type { Environment } from "./environment";
import type { Template } from "./template";
import { findLinkPath } from "./utils";
import { vento } from "./vento";

export class TemplateEngine {
	// biome-ignore lint/suspicious/noExplicitAny: needs to be typed properly
	vento: any;

	constructor(loader: unknown) {
		this.vento = vento({
			dataVarname: "pochoir",
			autoDataVarname: true,
			loader,
		});
	}

	async renderString(content: string, data: unknown, path?: string) {
		const result = await this.vento.runString(content, data, path);
		return result.content as string;
	}

	async renderTemplate(template: Template, data: unknown) {
		const content = template.getContent();
		const path = template.info.file.path;
		return this.renderString(content, data, path);
	}
}

export class VentoLoader {
	pochoir: Environment;

	constructor(pochoir: Environment) {
		this.pochoir = pochoir;
	}

	async load(path: string) {
		// biome-ignore lint/style/noNonNullAssertion: already resolved
		const file = this.pochoir.plugin.app.vault.getFileByPath(path)!;
		const template = await this.pochoir.parseTemplate(file);
		return { source: template.getContent() };
	}

	resolve(_from: string, path: string) {
		const file = findLinkPath(this.pochoir.plugin.app, path);
		if (!file) throw new Error("File does not exist");
		return file.path;
	}
}
