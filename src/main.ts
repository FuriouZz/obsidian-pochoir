import { Plugin } from "obsidian";
import {
    createFromTemplateCommand,
    insertFromTemplateCommand,
} from "./commands";
import { Environment } from "./environment";
import dateExtension from "./extensions/date-extension";
import formExtension from "./extensions/form-extension";
import internalPropertiesExtension from "./extensions/internal-properties-extension";
import javascriptExtension from "./extensions/javascript-extension";
import minimalExtension from "./extensions/minimal-extension";
import ribbonExtension from "./extensions/ribbon-extension";
import { DEFAULT_SETTINGS, type ISettings, SettingTab } from "./setting-tab";
import { TemplateModalSuggester } from "./suggesters/template-modal-suggester";

export default class PochoirPlugin extends Plugin {
    settings: ISettings = { ...DEFAULT_SETTINGS };
    environment = new Environment(this);
    templateSuggester = new TemplateModalSuggester(this);

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SettingTab(this));

        this.registerEvent(
            this.app.metadataCache.on("changed", (file) => {
                this.environment.invalidateFile(file);
            }),
        );

        insertFromTemplateCommand(this);
        createFromTemplateCommand(this);

        this.app.workspace.onLayoutReady(() => {
            this.environment.invalidate();
        });
    }

    onunload() {
        this.environment.cleanup();
    }

    async loadSettings() {
        this.settings = { ...this.settings, ...(await this.loadData()) };
        await this.#updateEnvironment();
    }

    async saveSettings() {
        await this.saveData(this.settings);
        await this.#updateEnvironment();
    }

    async #updateEnvironment() {
        this.environment.use(minimalExtension());
        if (this.settings.enable_js_codeblock) {
            this.environment.use(javascriptExtension());
        }
        this.environment.use(dateExtension());
        this.environment.use(formExtension());
        this.environment.use(internalPropertiesExtension());
        this.environment.use(ribbonExtension());

        await this.environment.updateSettings(this.settings);
    }
}
