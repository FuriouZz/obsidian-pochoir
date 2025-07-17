import { PluginSettingTab, Setting } from "obsidian";
import type PochoirPlugin from "./main";
import { FileInputSuggester } from "./suggesters/file-input-suggester";

export type ActivableExtension = "javascript" | "command";

export interface ISettings {
    templates_folder: string;
    disabled_extension: ActivableExtension[];
}

export const DEFAULT_SETTINGS: ISettings = {
    templates_folder: "templates",
    disabled_extension: ["javascript", "command"],
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
            .setName("Enable Javascript extension")
            .setDesc(
                "Use Javascript for more complex template or expose new functions",
            )
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.hasExtension("javascript"));
                toggle.onChange(async (value) => {
                    value
                        ? await this.plugin.addExtension("javascript")
                        : await this.plugin.removeExtension("javascript");
                });
            });

        new Setting(containerEl)
            .setName("Enable Command extension")
            .setDesc("Trigger template from command palette or ribbon action")
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.hasExtension("command"));
                toggle.onChange(async (value) => {
                    value
                        ? await this.plugin.addExtension("command")
                        : await this.plugin.removeExtension("command");
                });
            });
    }
}
