import { Plugin } from "obsidian";
import {
  createFromTemplateCommand,
  insertFromTemplateCommand,
} from "./commands";
import { Environment } from "./environment";
import { createFromTemplateFileMenuItem } from "./events";
import dateProvider from "./extensions/dateProvider";
import fileProvider from "./extensions/fileProvider";
import formProvider from "./extensions/formProvider";
import importProvider from "./extensions/importProvider";
import jsCodeBlock from "./extensions/jsCodeBlock";
import { type ISettings, SettingTab } from "./setting_tab";
import { NoteModalSuggester } from "./suggesters/note_modal_suggester";
import { TemplateModalSuggester } from "./suggesters/template_modal_suggester";

export default class PochoirPlugin extends Plugin {
  settings: ISettings = {};
  pochoir = new Environment(this);
  templateSuggester = new TemplateModalSuggester(this);
  noteSuggester = new NoteModalSuggester(this);

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingTab(this));

    this.pochoir.use(jsCodeBlock());
    this.pochoir.use(importProvider());
    this.pochoir.use(dateProvider());
    this.pochoir.use(formProvider());
    this.pochoir.use(fileProvider());

    insertFromTemplateCommand(this);
    createFromTemplateCommand(this);
    createFromTemplateFileMenuItem(this);
  }

  onunload() {
    this.pochoir.clear();
  }

  async loadSettings() {
    this.settings = { ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
    await this.pochoir.updateTemplateList();
  }
}
