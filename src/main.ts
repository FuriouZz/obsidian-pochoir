import { Plugin } from "obsidian";
import { insertFromTemplateCommand } from "./commands";
import { type ISettings, SettingTab } from "./settings";

import { Pochoir } from "./core/Pochoir";

import dateProvider from "./extensions/dateProvider";
import includeProvider from "./extensions/includeProvider";
import jsCodeBlock from "./extensions/jsCodeBlock";
import ymlCodeBlock from "./extensions/ymlCodeBlock";

export default class PochoirPlugin extends Plugin {
	settings: ISettings = {};
	pochoir = new Pochoir(this);

	async onload() {
		await this.loadSettings();

		this.pochoir.use(jsCodeBlock());
		this.pochoir.use(ymlCodeBlock());
		this.pochoir.use(includeProvider());
		this.pochoir.use(dateProvider());

		this.addSettingTab(new SettingTab(this));
		insertFromTemplateCommand(this);
		// openFileWithTemplate(this);
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
