import { PluginSettingTab, Setting } from "obsidian";
import type PochoirPlugin from "./main";
import { FileInputSuggester } from "./suggesters/file-input-suggester";

export interface ISettings {
    templates_folder: string;
    enable_js_codeblock: boolean;
}

export const DEFAULT_SETTINGS: ISettings = {
    templates_folder: "templates",
    enable_js_codeblock: false,
};

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
                search.setValue(this.plugin.settings.templates_folder);
                const suggester = new FileInputSuggester(
                    this.plugin.app,
                    search.inputEl,
                    "folder",
                ).onSelect(async (value) => {
                    search.setValue(value.path);
                    this.plugin.settings.templates_folder = value.path;
                    await this.plugin.saveSettings();
                    suggester.close();
                });
            });

        new Setting(containerEl)
            .setName("Enable Javascript Codeblock")
            .setDesc(
                "Use Javascript for more complex template or expose new functions",
            )
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.enable_js_codeblock);
                toggle.onChange(async (value) => {
                    this.plugin.settings.enable_js_codeblock = value;
                    await this.plugin.saveSettings();
                });
            });
    }
}
