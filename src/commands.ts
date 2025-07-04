import type PochoirPlugin from "src/main";

export function insertFromTemplateCommand(plugin: PochoirPlugin) {
  plugin.addCommand({
    id: "insert-from-template",
    name: "Insert template",
    icon: "templater-icon",
    async callback() {
      await plugin.pochoir.updateTemplateList();
      plugin.templateSuggester.insertTemplate();
    },
  });
}

export function createFromTemplateCommand(plugin: PochoirPlugin) {
  plugin.addCommand({
    id: "create-from-template",
    name: "Create from template",
    icon: "templater-icon",
    async callback() {
      await plugin.pochoir.updateTemplateList();
      plugin.templateSuggester.createFromTemplate();
    },
  });
}

export function openSwitcherCommand(plugin: PochoirPlugin) {
  plugin.addCommand({
    id: "open-switcher",
    name: "Open Switcher",
    icon: "templater-icon",
    callback() {
      plugin.noteSuggester.open();
    },
  });
}
