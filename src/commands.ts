import type PochoirPlugin from "./main";

export function insertFromTemplateCommand(plugin: PochoirPlugin) {
    plugin.addCommand({
        id: "insert-from-template",
        name: "Insert template",
        icon: "templater-icon",
        async callback() {
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
            plugin.templateSuggester.createFromTemplate();
        },
    });
}
