import type PochoirPlugin from "src/main";
import NoteSuggestModal from "./modals/NoteSuggestModal";
import TemplateSuggestModal from "./modals/TemplateSuggestModal";

export function insertFromTemplateCommand(plugin: PochoirPlugin) {
	plugin.addCommand({
		id: "insert-from-template",
		name: "Insert template",
		icon: "templater-icon",
		callback() {
			new TemplateSuggestModal(plugin).open();
		},
	});
}

export function openFileWithTemplate(plugin: PochoirPlugin) {
	plugin.addCommand({
		id: "open-file",
		name: "Open file",
		icon: "templater-icon",
		callback() {
			new NoteSuggestModal(plugin).open();
		},
	});
}
