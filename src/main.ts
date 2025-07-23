import { Plugin } from "obsidian";
import { codeBlocksHighlighter } from "./codemirror/codeBlockHighlighter";
import {
    createFromTemplateCommand,
    insertFromTemplateCommand,
} from "./commands";
import { DEFAULT_SETTINGS } from "./constants";
import { Environment } from "./environment";
import commandExtension from "./extensions/command-extension";
import dateExtension from "./extensions/date-extension";
import formExtension from "./extensions/form-extension";
import javascriptExtension from "./extensions/javascript-extension";
import minimalExtension from "./extensions/minimal-extension";
import specialPropertiesExtension from "./extensions/special-properties-extension";
import { getLogger } from "./logger";
import { type ISettings, SettingTab } from "./setting-tab";
import { TemplateModalSuggester } from "./suggesters/template-modal-suggester";

export default class PochoirPlugin extends Plugin {
    settings: ISettings = { ...DEFAULT_SETTINGS };
    environment = new Environment(this);
    templateSuggester = new TemplateModalSuggester(this.app, this.environment);
    logger = getLogger();

    async onload() {
        this.logger.level = "DEBUG";
        this.addSettingTab(new SettingTab(this));

        this.registerEvent(
            this.app.metadataCache.on("changed", (file) => {
                this.environment.invalidateFile(file);
            }),
        );

        insertFromTemplateCommand(this, this.templateSuggester);
        createFromTemplateCommand(this, this.templateSuggester);

        this.app.workspace.onLayoutReady(() => {
            this.environment.invalidate();
        });

        codeBlocksHighlighter(this, this.environment);

        this.environment.extensions.use(minimalExtension());
        this.environment.extensions.use(specialPropertiesExtension());
        this.environment.extensions.use(dateExtension());
        this.environment.extensions.use(formExtension());
        this.environment.extensions.use(commandExtension());
        this.environment.extensions.use(javascriptExtension());

        await this.loadSettings();
    }

    onunload() {
        this.environment.cleanup();
    }

    async loadSettings() {
        this.settings = { ...this.settings, ...(await this.loadData()) };
        this.environment.extensions.enabled.join(this.settings.extensions);
        await this.#updateEnvironment();
    }

    async saveSettings() {
        this.settings.extensions = [...this.environment.extensions.enabled];
        await this.saveData(this.settings);
        await this.#updateEnvironment();
    }

    async #updateEnvironment() {
        this.logger.verbose("updateEnvironment");
        this.environment.cleanup();
        this.environment.extensions.run(this.environment);
        await this.environment.updateSettings(this.settings);
    }

    async addExtgnsion(name: string) {
        const arr = this.settings.extensions;
        if (!arr.includes(name)) {
            arr.push(name);
            await this.saveSettings();
        }
    }

    hasExtension(name: string) {
        return this.settings.extensions.includes(name);
    }

    async removeExtension(name: string) {
        const arr = this.settings.extensions;
        const index = arr.indexOf(name);
        if (index > -1) {
            arr.splice(index, 1);
            await this.saveSettings();
        }
    }
}
