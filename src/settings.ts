import { PluginSettingTab, Setting } from "obsidian";
import type PochoirPlugin from "src/main";
import FolderSuggester from "./suggesters/FolderSuggester";

export interface ISettings {
	templates_folder?: string;
}

export class SettingTab extends PluginSettingTab {
	plugin: PochoirPlugin;

	constructor(plugin: PochoirPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Template folder location")
			.setDesc("Files in this folder will be available as templates.")
			.addSearch((search) => {
				search.setValue(this.plugin.settings.templates_folder ?? "");
				const suggester = new FolderSuggester(
					this.plugin,
					search.inputEl,
				).onSelect(async (value) => {
					search.setValue(value);
					this.plugin.settings.templates_folder = value;
					await this.plugin.saveSettings();
					suggester.close();
				});
			});
	}
}
