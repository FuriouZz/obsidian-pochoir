import { FuzzySuggestModal, type TFile, type TFolder } from "obsidian";
import type PochoirPlugin from "src/main";

export enum OpenMode {
  InsertTemplate,
  CreateFromTemplate,
}

export class TemplateModalSuggester extends FuzzySuggestModal<TFile> {
  plugin: PochoirPlugin;
  openMode: OpenMode;
  folderLocation?: TFolder;

  constructor(plugin: PochoirPlugin) {
    super(plugin.app);
    this.plugin = plugin;
    this.openMode = OpenMode.InsertTemplate;
  }

  getSuggestions(query: string) {
    let items = this.plugin.pochoir.list.templates;
    const hasQuery = !!query.trim();

    if (hasQuery) {
      items = items.filter((template) => {
        const aliases = template.info.internalProperties?.["pochoir.aliases"] as
          | string[]
          | undefined;
        if (!aliases) return false;
        const parts = query.split(" ");
        return aliases.some((item) =>
          parts.find((part) => item.contains(part)),
        );
      });
    }

    return items.map((template) => {
      const name = template.info.file.basename;
      return {
        item: template.info.file,
        match: {
          matches: hasQuery ? [[0, name.length] as [number, number]] : [],
          score: 0,
        },
      };
    });
  }

  getItems(): TFile[] {
    return this.plugin.pochoir.list.templates.map((t) => t.info.file);
  }

  getItemText(item: TFile): string {
    return item.basename;
  }

  onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
    switch (this.openMode) {
      case OpenMode.InsertTemplate: {
        this.plugin.pochoir.insertTemplate(item);
        break;
      }
      case OpenMode.CreateFromTemplate: {
        const folder = this.folderLocation;
        this.folderLocation = undefined;
        this.plugin.pochoir.createFromTemplate(item, {
          openNote: true,
          folder,
        });
        break;
      }
    }
  }

  async #open() {
    await this.plugin.pochoir.updateTemplateList();
    this.open();
  }

  insertTemplate() {
    this.openMode = OpenMode.InsertTemplate;
    this.#open();
  }

  createFromTemplate(folderLocation?: TFolder) {
    this.openMode = OpenMode.CreateFromTemplate;
    this.folderLocation = folderLocation;
    this.#open();
  }
}
