import { PluginSettingTab, Setting } from "obsidian";
import type PochoirPlugin from "./main";
import { FileInputSuggester } from "./suggesters/file-input-suggester";
import { minidownFragment } from "./utils/minidown";

export interface ISettings {
    templates_folder: string;
    extensions: string[];
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

        const env = this.plugin.environment;

        for (const { settings, name } of env.extensions.values()) {
            if (!settings) continue;

            new Setting(containerEl)
                .setName(minidownFragment(settings.label ?? ""))
                .setDesc(minidownFragment(settings.desc ?? ""))
                .addToggle((toggle) => {
                    toggle.setValue(env.extensions.enabled.has(name));
                    toggle.onChange(async (value) => {
                        env.extensions.enabled.toggle(name, value);
                        await this.plugin.saveSettings();
                    });
                });
        }
    }
}
