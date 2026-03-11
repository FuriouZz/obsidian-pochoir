import type { Plugin } from "obsidian";
import type { CursorJumper } from "../obsidian/cursor-jumper";
import type { TemplateModalSuggester } from "../suggesters/template-modal-suggester";

export function insertFromTemplateCommand(
    plugin: Plugin,
    suggester: TemplateModalSuggester,
) {
    plugin.addCommand({
        id: "insert-from-template",
        name: "Insert template",
        icon: "pochoir-icon",
        checkCallback(checking) {
            const file = plugin.app.workspace.getActiveFile();
            if (file) {
                if (!checking) {
                    suggester.insertTemplate();
                }
                return true;
            }
            return false;
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

export function jumpToNextCursorLocationCommand(
    plugin: Plugin,
    jumper: CursorJumper,
) {
    plugin.addCommand({
        id: "jump-to-next-cursor-location",
        name: "Jump to next cursor location",
        icon: "text-cursor",
        checkCallback(checking) {
            const file = plugin.app.workspace.getActiveFile();
            if (file) {
                if (!checking) {
                    jumper.jump();
                }
                return true;
            }
            return false;
        },
    });
}
