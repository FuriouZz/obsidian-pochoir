import { TFolder } from "obsidian";
import type PochoirPlugin from "src/main";

export function createFromTemplateFileMenuItem(plugin: PochoirPlugin) {
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", (menu, file) => {
      if (!(file instanceof TFolder)) return;

      menu.addItem((item) => {
        item.setTitle("Create note from template").onClick(async () => {
          plugin.templateSuggester.createFromTemplate(file);
        });
      });
    }),
  );
}
