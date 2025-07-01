import { FuzzySuggestModal, TFile, TFolder, Vault } from "obsidian";
import type PochoirPlugin from "src/main";

export enum OpenMode {
	InsertTemplate,
	CreateFromTemplate,
}

export default class TemplateSuggester extends FuzzySuggestModal<TFile> {
	plugin: PochoirPlugin;
	openMode: OpenMode;
	folderLocation?: TFolder;

	constructor(plugin: PochoirPlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	getItems(): TFile[] {
		const files: TFile[] = [];
		const folder = this.plugin.app.vault.getFolderByPath(
			this.plugin.settings.templates_folder ?? "/",
		);
		if (!folder) return files;
		Vault.recurseChildren(folder, (item) => {
			if (item instanceof TFile) files.push(item);
		});
		return files;
	}

	getTemplates() {
		const files: TFile[] = [];
		const folder = this.plugin.app.vault.getFolderByPath(
			this.plugin.settings.templates_folder ?? "/",
		);
		if (!folder) return files;
		Vault.recurseChildren(folder, (item) => {
			if (item instanceof TFile) files.push(item);
		});
		return files;
	}

	getItemText(item: TFile): string {
		return item.getShortName();
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

	insertTemplate() {
		this.openMode = OpenMode.InsertTemplate;
		this.open();
	}

	createFromTemplate(folderLocation?: TFolder) {
		this.openMode = OpenMode.CreateFromTemplate;
		this.folderLocation = folderLocation;
		this.open();
	}
}
