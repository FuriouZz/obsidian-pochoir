import type { Plugin } from "obsidian";
import type { TemplateModalSuggester } from "./suggesters/template-modal-suggester";

export function insertFromTemplateCommand(
    plugin: Plugin,
    suggester: TemplateModalSuggester,
) {
    plugin.addCommand({
        id: "insert-from-template",
        name: "Insert template",
        icon: "pochoir-icon",
        callback() {
            suggester.insertTemplate();
        },
    });
}

export function createFromTemplateCommand(
    plugin: Plugin,
    suggester: TemplateModalSuggester,
) {
    plugin.addCommand({
        id: "create-from-template",
        name: "Create from template",
        icon: "pochoir-icon",
        callback() {
            suggester.createFromTemplate();
        },
    });
}
