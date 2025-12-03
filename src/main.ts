import { Plugin } from "obsidian";
import {
    createFromTemplateCommand,
    insertFromTemplateCommand,
} from "./commands";
import { DEFAULT_SETTINGS } from "./constants";
import { Environment } from "./environment";
import commandExtension from "./extensions/command-extension";
import dateExtension from "./extensions/date-extension";
import formExtension from "./extensions/form-extension";
import { FormView } from "./extensions/form-extension/obsidian";
import javascriptExtension from "./extensions/javascript-extension";
import minimalExtension from "./extensions/minimal-extension";
import propertiesExtension from "./extensions/properties-extension";
import snippetExtension from "./extensions/snippet-extension";
import specialPropertiesExtension from "./extensions/special-properties-extension";
import { LOGGER } from "./logger";
import { type ISettings, SettingTab } from "./setting-tab";
import { TemplateModalSuggester } from "./suggesters/template-modal-suggester";

export default class PochoirPlugin extends Plugin {
    settings: ISettings = { ...DEFAULT_SETTINGS };
    environment = new Environment(this);
    templateSuggester = new TemplateModalSuggester(this.app, this.environment);

    async onload() {
        LOGGER.level = import.meta.env.DEV ? "VERBOSE" : "DEBUG";
        this.addSettingTab(new SettingTab(this));

        insertFromTemplateCommand(this, this.templateSuggester);
        createFromTemplateCommand(this, this.templateSuggester);

        this.environment.extensions.use(minimalExtension());
        this.environment.extensions.use(propertiesExtension());
        this.environment.extensions.use(specialPropertiesExtension());
        this.environment.extensions.use(dateExtension());
        this.environment.extensions.use(formExtension());
        this.environment.extensions.use(commandExtension());
        this.environment.extensions.use(javascriptExtension());
        this.environment.extensions.use(snippetExtension());

        this.app.workspace.onLayoutReady(() => {
            this.register(this.environment.enable());
        });

        this.registerView(FormView.type, (leaf) => new FormView(leaf));

        await this.loadSettings();
    }

    onunload() {
        this.environment.cleanup();
    }

    async loadSettings() {
        const data = (await this.loadData()) as ISettings;
        this.settings = { ...this.settings, ...data };
        this.environment.extensions.enabled.join(this.settings.extensions);
        this.#updateEnvironment();
    }

    async saveSettings() {
        this.settings.extensions = [...this.environment.extensions.enabled];
        await this.saveData(this.settings);
        this.#updateEnvironment();
    }

    #updateEnvironment() {
        LOGGER.verbose("updateEnvironment");
        this.environment.cleanup();
        this.environment.updateSettings(this.settings);
        this.environment.extensions.run(this.environment);
    }
}
