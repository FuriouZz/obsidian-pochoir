import { TFolder } from "obsidian";
import type PochoirPlugin from "src/main";

export function createFromTemplateFileMenuItem(plugin: PochoirPlugin) {
	plugin.registerEvent(
		plugin.app.workspace.on("file-menu", (menu, file) => {
			console.log(menu, file);
			if (!(file instanceof TFolder)) return;

			menu.addItem((item) => {
				item.setTitle("Create note from template").onClick(() => {
					plugin.templateSuggester.createFromTemplate(file);
				});
			});
		}),
	);
}
