import { TFile, Vault } from "obsidian";
import type { Environment } from "./environment";
import type { Template } from "./template";

export class TemplateList {
	templates: Template[] = [];

	async refresh(env: Environment) {
		this.templates.length = 0;
		const files: TFile[] = [];
		const folder = env.plugin.app.vault.getFolderByPath(
			env.plugin.settings.templates_folder ?? "/",
		);
		if (!folder) return files;
		Vault.recurseChildren(folder, (item) => {
			if (item instanceof TFile) files.push(item);
		});

		this.templates = await Promise.all(
			files.map((file) => env.parseTemplate(file)),
		);
	}

	findByPath(path: string) {
		return this.templates.find((t) => t.info.file.path === path);
	}

	findByFile(file: TFile) {
		return this.templates.find((t) => t.info.file === file);
	}

	getTemplateByFile(file: TFile) {
		const template = this.findByFile(file);
		if (!template) {
			throw new Error(`No template with name: ${file.basename}`);
		}
		return template;
	}
}
