import {
    type App,
    type FuzzyMatch,
    FuzzySuggestModal,
    SearchMatches,
    SearchMatchPart,
    type TFolder,
} from "obsidian";
import type { Environment } from "../environment";
import type { Template } from "../template";

export enum OpenMode {
    InsertTemplate,
    CreateFromTemplate,
}

export type TemplateModalEntry = {
    template: Template;
    title: string;
    subtitle?: string;
};

export class TemplateModalSuggester extends FuzzySuggestModal<TemplateModalEntry> {
    environment: Environment;
    openMode: OpenMode;
    folderLocation?: TFolder;

    constructor(app: App, env: Environment) {
        super(app);
        this.environment = env;
        this.openMode = OpenMode.InsertTemplate;
    }

    getItems(): TemplateModalEntry[] {
        let items = Array.from(
            this.environment.cache.templates.values(),
        ).map<TemplateModalEntry>((template) => ({
            template,
            title: template.getDisplayName(),
        }));

        for (const suggester of this.environment.templateSuggesters) {
            items = suggester.getItems?.({ suggester: this, items }) ?? items;
        }

        return items;
    }

    override getSuggestions(query: string) {
        for (const suggester of this.environment.templateSuggesters) {
            const suggestions = suggester.getSuggestions?.({
                suggester: this,
                query,
            });
            if (suggestions) return suggestions;
        }

        return super.getSuggestions(query);
    }

    override renderSuggestion(
        match: FuzzyMatch<TemplateModalEntry>,
        el: HTMLElement,
    ): void {
        const {
            item: { title, subtitle },
            match: { matches },
        } = match;

        el.classList.add("pochoir-suggester");
        const titleEl = el.createDiv({ cls: "pochoir-suggester-title" });
        this.highlightMatches(titleEl, title, matches);
        if (subtitle) {
            el.createDiv({ cls: "pochoir-suggester-subtitle" }).setText(
                subtitle,
            );
        }
    }

    createSearchMatches(text: string, pattern: string) {
        const matches: SearchMatches = [];
        const results = text.matchAll(new RegExp(pattern, "g"));
        let score = 0;

        for (const match of results) {
            if (match[0].length == 0) continue;
            matches.push([match.index, match.index + match[0].length]);

            score = Math.max(match[0].length / text.length, score);
        }

        return { matches, score };
    }

    highlightMatches(el: HTMLElement, text: string, matches: SearchMatches) {
        let i = 0;
        let start = 0;
        let ret: SearchMatchPart;

        while (i <= matches.length) {
            ret = matches[i];

            if (ret) {
                const [from, to] = ret;

                el.createEl("span").setText(text.slice(start, from));
                el.createEl("b").setText(text.slice(from, to));
                start = to;

                i++;
            } else {
                el.createEl("span").setText(text.slice(start, text.length));
                break;
            }
        }
    }

    getItemText(item: TemplateModalEntry): string {
        return item.template.getDisplayName();
    }

    onChooseItem(
        item: TemplateModalEntry,
        _evt: MouseEvent | KeyboardEvent,
    ): void {
        switch (this.openMode) {
            case OpenMode.InsertTemplate: {
                this.environment.insertFromTemplate(item.template);
                break;
            }
            case OpenMode.CreateFromTemplate: {
                const folder = this.folderLocation;
                this.folderLocation = undefined;
                this.environment.createFromTemplate(item.template, {
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
