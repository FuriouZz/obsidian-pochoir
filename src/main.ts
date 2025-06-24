import { Plugin } from "obsidian";
import { insertFromTemplateCommand } from "src/commands";
import { type ISettings, SettingTab } from "src/settings";
import Pochoir from "./core/Pochoir";

export default class PochoirPlugin extends Plugin {
	settings: ISettings = {};
	template = new Pochoir();

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this));
		insertFromTemplateCommand(this);
		// openFileWithTemplate(this);
	}

	onunload() {}

	async loadSettings() {
		this.settings = { ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
