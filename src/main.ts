import { Plugin } from "obsidian";
import {
    createFromTemplateCommand,
    insertFromTemplateCommand,
} from "./commands";
import { Environment } from "./environment";
import dateProvider from "./extensions/dateProvider";
import formProvider from "./extensions/formProvider";
import internalProperties from "./extensions/internalProperties";
import javascriptProcessor from "./extensions/javascriptProcessor";
import minimal from "./extensions/minimal";
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
        this.environment.use(minimal());
        if (this.settings.enable_js_codeblock) {
            this.environment.use(javascriptProcessor());
        }
        this.environment.use(dateProvider());
        this.environment.use(formProvider());
        this.environment.use(internalProperties());

        await this.environment.updateSettings(this.settings);
    }
}
