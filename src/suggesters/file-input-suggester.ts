import { AbstractInputSuggest, type TAbstractFile } from "obsidian";

export class FileInputSuggester extends AbstractInputSuggest<TAbstractFile> {
    type: "file" | "folder" = "file";

    protected getSuggestions(
        query: string,
    ): TAbstractFile[] | Promise<TAbstractFile[]> {
        const { vault } = this.app;
        const entries =
            this.type === "file"
                ? vault.getMarkdownFiles()
                : vault.getAllFolders(true);
        return entries.filter(
            (file) =>
                file.path.includes(query) ||
                file.path.toLocaleLowerCase().includes(query),
        );
    }

    renderSuggestion(value: TAbstractFile, el: HTMLElement): void {
        el.setText(value.path);
    }
}
