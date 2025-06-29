import { Plugin } from "obsidian";
import { insertFromTemplateCommand } from "./commands";
import { type ISettings, SettingTab } from "./settings";

import { Pochoir } from "./core/Pochoir";

import dateProvider from "./extensions/dateProvider";
import includeProvider from "./extensions/includeProvider";
import jsCodeBlock from "./extensions/jsCodeBlock";
import propertiesProvider from "./extensions/propertiesProvider";
import ymlCodeBlock from "./extensions/ymlCodeBlock";
import extensionProvider from "./extensions/extensionProvider";

export default class PochoirPlugin extends Plugin {
	settings: ISettings = {};
	pochoir = new Pochoir(this);

	async onload() {
		await this.loadSettings();

		this.pochoir.use(jsCodeBlock());
		this.pochoir.use(ymlCodeBlock());
		this.pochoir.use(propertiesProvider());
		this.pochoir.use(includeProvider());
		this.pochoir.use(dateProvider());
		this.pochoir.use(extensionProvider());

		this.pochoir.enable();

		this.addSettingTab(new SettingTab(this));
		insertFromTemplateCommand(this);
		// openFileWithTemplate(this);
	}

	onunload() {
		this.pochoir.codeBlocks.length = 0;
		this.pochoir.providers.length = 0;
		this.pochoir.disable();
	}

	async loadSettings() {
		this.settings = { ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
