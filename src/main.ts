import { Plugin } from "obsidian";
import {
	createFromTemplateCommand,
	insertFromTemplateCommand,
} from "./commands";
import { Pochoir } from "./core/Pochoir";
import dateProvider from "./extensions/dateProvider";
import includeProvider from "./extensions/includeProvider";
import jsCodeBlock from "./extensions/jsCodeBlock";
import ymlCodeBlock from "./extensions/ymlCodeBlock";
import TemplateSuggester from "./modals/TemplateSuggestModal";
import { type ISettings, SettingTab } from "./settings";

export default class PochoirPlugin extends Plugin {
	settings: ISettings = {};
	pochoir = new Pochoir(this);
	templateSuggester = new TemplateSuggester(this);

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this));

		this.pochoir.use(jsCodeBlock());
		this.pochoir.use(ymlCodeBlock());
		this.pochoir.use(includeProvider());
		this.pochoir.use(dateProvider());

		insertFromTemplateCommand(this);
		createFromTemplateCommand(this);
	}

	onunload() {
		this.pochoir.codeBlockProcessors.length = 0;
		this.pochoir.contextProviders.length = 0;
	}

	async loadSettings() {
		this.settings = { ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
