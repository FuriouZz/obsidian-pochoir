import { Plugin } from "obsidian";
import {
    createFromTemplateCommand,
    insertFromTemplateCommand,
} from "./commands";
import { Environment } from "./environment";
import commandExtension from "./extensions/command-extension";
import dateExtension from "./extensions/date-extension";
import formExtension from "./extensions/form-extension";
import internalPropertiesExtension from "./extensions/internal-properties-extension";
import javascriptExtension from "./extensions/javascript-extension";
import minimalExtension from "./extensions/minimal-extension";
import { getLogger } from "./logger";
import {
    type ActivableExtension,
    DEFAULT_SETTINGS,
    type ISettings,
    SettingTab,
} from "./setting-tab";
import { TemplateModalSuggester } from "./suggesters/template-modal-suggester";

export default class PochoirPlugin extends Plugin {
    settings: ISettings = { ...DEFAULT_SETTINGS };
    environment = new Environment(this);
    templateSuggester = new TemplateModalSuggester(this);
    logger = getLogger();

    async onload() {
        this.logger.level = "DEBUG";
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
        this.logger.verbose("updateEnvironment");
        this.environment.cleanup();
        this.environment.use(minimalExtension());
        this.environment.use(dateExtension());
        this.environment.use(formExtension());
        this.environment.use(internalPropertiesExtension());
        if (this.hasExtension("javascript")) {
            this.environment.use(javascriptExtension());
        }
        if (this.hasExtension("command")) {
            this.environment.use(commandExtension());
        }
        await this.environment.updateSettings(this.settings);
    }

    async addExtension(name: ActivableExtension) {
        const arr = this.settings.disabled_extension;
        const index = arr.indexOf(name);
        if (index > -1) {
            arr.splice(index, 1);
            await this.saveSettings();
        }
    }

    hasExtension(name: ActivableExtension) {
        const arr = this.settings.disabled_extension;
        return !arr.includes(name);
    }

    async removeExtension(name: ActivableExtension) {
        const arr = this.settings.disabled_extension;
        if (!arr.includes(name)) {
            arr.push(name);
            await this.saveSettings();
        }
    }
}
