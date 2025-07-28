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
import propertiesExtension from "./extensions/properties-extension";
import specialPropertiesExtension from "./extensions/special-properties-extension";
import { getLogger } from "./logger";
import { type ISettings, SettingTab } from "./setting-tab";
import { TemplateModalSuggester } from "./suggesters/template-modal-suggester";
import { FormView } from "./extensions/form-extension/obsidian";

export default class PochoirPlugin extends Plugin {
    settings: ISettings = { ...DEFAULT_SETTINGS };
    environment = new Environment(this);
    templateSuggester = new TemplateModalSuggester(this.app, this.environment);
    logger = getLogger();

    async onload() {
        this.logger.level = "VERBOSE";
        this.addSettingTab(new SettingTab(this));

        insertFromTemplateCommand(this, this.templateSuggester);
        createFromTemplateCommand(this, this.templateSuggester);
        codeBlocksHighlighter(this, this.environment);

        this.environment.extensions.use(minimalExtension());
        this.environment.extensions.use(propertiesExtension());
        this.environment.extensions.use(specialPropertiesExtension());
        this.environment.extensions.use(dateExtension());
        this.environment.extensions.use(formExtension());
        this.environment.extensions.use(commandExtension());
        this.environment.extensions.use(javascriptExtension());

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
        this.environment.updateSettings(this.settings);
        this.environment.extensions.run(this.environment);
    }
}
