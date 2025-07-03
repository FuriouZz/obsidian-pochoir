import { FuzzySuggestModal, type TFile } from "obsidian";
import type PochoirPlugin from "src/main";

export class NoteModalSuggester extends FuzzySuggestModal<TFile> {
	plugin: PochoirPlugin;

	constructor(plugin: PochoirPlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	getSuggestions(query: string) {
		const tagRegex = /#\S+/g;
		const tags = query.match(tagRegex);
		const newQuery = query.replace(tagRegex, "").trim();
		return super.getSuggestions(newQuery);
	}

	getItems(): TFile[] {
		return this.app.vault.getMarkdownFiles();
	}

	getItemText(item: TFile): string {
		return item.basename;
	}

	onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {}
}
