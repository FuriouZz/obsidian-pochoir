import { AbstractInputSuggest } from "obsidian";
import type PochoirPlugin from "src/main";

export default class FolderSuggester extends AbstractInputSuggest<string> {
	plugin: PochoirPlugin;

	constructor(plugin: PochoirPlugin, input: HTMLInputElement) {
		super(plugin.app, input);
		this.plugin = plugin;
	}

	protected getSuggestions(query: string): string[] | Promise<string[]> {
		return this.plugin.app.vault
			.getAllFolders(true)
			.filter(
				(file) =>
					file.path.includes(query) ||
					file.path.toLocaleLowerCase().includes(query),
			)
			.map((f) => f.path);
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}
}
