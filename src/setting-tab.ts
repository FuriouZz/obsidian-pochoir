import { PluginSettingTab, Setting } from "obsidian";
import { EXTENSION_SETTINGS } from "./constants";
import type PochoirPlugin from "./main";
import { FileInputSuggester } from "./suggesters/file-input-suggester";

export type ActivableExtension =
    | "special-properties"
    | "javascript"
    | "command"
    | "form";

export type ActivableExtensionList = [
    ActivableExtension,
    {
        label: string;
        desc: string | (() => string | DocumentFragment);
    },
][];

export interface ISettings {
    templates_folder: string;
    extensions: ActivableExtension[];
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

        for (const [extension, { label, desc }] of EXTENSION_SETTINGS) {
            new Setting(containerEl)
                .setName(label)
                .setDesc(typeof desc === "string" ? desc : desc())
                .addToggle((toggle) => {
                    toggle.setValue(this.plugin.hasExtension(extension));
                    toggle.onChange(async (value) => {
                        value
                            ? await this.plugin.addExtension(extension)
                            : await this.plugin.removeExtension(extension);
                    });
                });
        }
    }
}
