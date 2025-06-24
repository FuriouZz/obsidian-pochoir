import { FuzzySuggestModal, TFile, Vault } from "obsidian";
import type PochoirPlugin from "src/main";

export default class TemplateSuggestModal extends FuzzySuggestModal<TFile> {
	plugin: PochoirPlugin;

	constructor(plugin: PochoirPlugin) {
		super(plugin.app);
		this.plugin = plugin;
		this.instructionsEl.createEl("div", { text: "Hello World" });
		this.setInstructions([{ command: "↑↓", purpose: "Navigate" }]);
	}

	getItems(): TFile[] {
		const files: TFile[] = [];
		const folder = this.plugin.app.vault.getFolderByPath(
			this.plugin.settings.templates_folder ?? "/",
		);
		if (!folder) return files;
		Vault.recurseChildren(folder, (item) => {
			if (item instanceof TFile) files.push(item);
		});
		return files;
	}

	getItemText(item: TFile): string {
		return item.name;
	}

	onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
		this.plugin.template.insertTemplate(this.app, item);
	}
}
