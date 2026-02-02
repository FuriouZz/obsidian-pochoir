import {
    type App,
    type FuzzyMatch,
    FuzzySuggestModal,
    type SearchMatches,
    type SearchMatchPart,
} from "obsidian";
import type { Environment } from "../environment";
import { LOGGER } from "../logger";
import type { Template } from "../template";

export enum OpenMode {
    InsertTemplate,
    CreateFromTemplate,
}

export interface TemplateModalEntry {
    template: Template;
    title: string;
    subtitle?: string;
}

export interface TemplateModalSuggesterOptions {
    templates?: (string | Template)[];
}

export class TemplateModalSuggester extends FuzzySuggestModal<TemplateModalEntry> {
    environment: Environment;
    openMode: OpenMode;
    entries?: (string | Template)[];

    constructor(app: App, env: Environment) {
        super(app);
        this.environment = env;
        this.openMode = OpenMode.InsertTemplate;
    }

    getItems(): TemplateModalEntry[] {
        const templates: Template[] = [];

        if (this.entries) {
            for (const entry of this.entries) {
                let template: Template | undefined;
                if (typeof entry === "string") {
                    const res = this.environment.cache.resolve(entry);
                    if (res) template = res;
                } else {
                    template = entry;
                }
                if (template) templates.push(template);
            }
        } else {
            const entries = [
                ...this.environment.cache.templates.values(),
            ].filter((t) => !t.info.hidden);
            templates.push(...entries);
        }

        let items: TemplateModalEntry[] = templates.map<TemplateModalEntry>(
            (template) => ({
                template,
                title: template.getDisplayName(),
            }),
        );

        const suggesters = this.environment.templateSuggesters;
        for (const suggester of suggesters) {
            items = suggester.getItems?.({ suggester: this, items }) ?? items;
        }

        return items;
    }

    override getSuggestions(query: string) {
        const suggesters = this.environment.templateSuggesters;
        for (const suggester of suggesters) {
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
            if (match[0].length === 0) continue;

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
                this.environment
                    .insertFromTemplate(item.template)
                    .catch(LOGGER.error);
                break;
            }
            case OpenMode.CreateFromTemplate: {
                this.environment
                    .createFromTemplate(item.template, {
                        openNote: true,
                    })
                    .catch(LOGGER.error);
                break;
            }
        }
        this.entries = undefined;
    }

    insertTemplate(options?: TemplateModalSuggesterOptions) {
        this.openMode = OpenMode.InsertTemplate;
        this.entries = options?.templates;
        this.open();
    }

    createFromTemplate(options?: TemplateModalSuggesterOptions) {
        this.openMode = OpenMode.CreateFromTemplate;
        this.entries = options?.templates;
        this.open();
    }
}
