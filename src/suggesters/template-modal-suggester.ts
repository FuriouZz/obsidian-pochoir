import { type FuzzyMatch, FuzzySuggestModal, type TFolder } from "obsidian";
import type PochoirPlugin from "src/main";
import type { Template } from "../template";

export enum OpenMode {
    InsertTemplate,
    CreateFromTemplate,
}

type Entry = {
    template: Template;
    name: string;
    alias?: { text: string; match: RegExpMatchArray | null };
};

export class TemplateModalSuggester extends FuzzySuggestModal<Entry> {
    plugin: PochoirPlugin;
    openMode: OpenMode;
    folderLocation?: TFolder;

    constructor(plugin: PochoirPlugin) {
        super(plugin.app);
        this.plugin = plugin;
        this.openMode = OpenMode.InsertTemplate;
    }

    override getSuggestions(query: string) {
        const items = this.getItems();

        const matches = items
            .map((entry) => {
                const { properties } = entry.template.info.frontmatter;
                const aliases = properties["$.aliases"] as string[] | undefined;
                if (!Array.isArray(aliases)) return null;

                const parts = query.split(" ");
                const alias = aliases.find((item) =>
                    parts.find((part) => item.contains(part)),
                );

                if (!alias) return null;

                return {
                    entry,
                    alias,
                    match: alias.match(new RegExp(query)),
                };
            })
            .filter((entry) => entry !== null);

        if (matches.length === 0) {
            return super.getSuggestions(query);
        }

        return matches.map(({ entry, alias, match }) => {
            return {
                item: {
                    ...entry,
                    alias: { text: alias, match },
                },
                match: {
                    matches: [],
                    score: 0,
                },
            };
        });
    }

    override renderSuggestion(item: FuzzyMatch<Entry>, el: HTMLElement): void {
        super.renderSuggestion(item, el);
        el.classList.add("pochoir-suggester");

        const { properties } = item.item.template.info.frontmatter;
        const aliases = properties["$.aliases"] as string[] | undefined;
        if (!Array.isArray(aliases)) return;

        const subtitle = el.createDiv({ cls: "pochoir-suggester-subtitle" });

        const aliasMatched = item.item.alias;
        for (const [index, alias] of (aliases as string[]).entries()) {
            if (index > 0) {
                subtitle.createSpan({ text: ", " });
            }

            if (alias === aliasMatched?.text && aliasMatched?.match) {
                let start = 0;
                const parts: [number, number, "span" | "strong"][] = [];

                parts.push([start, aliasMatched.match.index ?? 0, "span"]);
                start = aliasMatched.match.index ?? 0;
                parts.push([
                    start,
                    start + aliasMatched.match[0].length,
                    "strong",
                ]);
                start = start + aliasMatched.match[0].length;
                parts.push([start, alias.length, "span"]);

                for (const part of parts) {
                    const text = alias.slice(part[0], part[1]);
                    if (!text) continue;
                    subtitle.createEl(part[2], { text });
                }
            } else {
                subtitle.createSpan({ text: alias });
            }
        }
    }

    getItems(): Entry[] {
        return [...this.plugin.environment.cache.templates.values()].map(
            (template) => ({ template, name: template.info.file.basename }),
        );
    }

    getItemText(item: Entry): string {
        return item.name;
    }

    onChooseItem(item: Entry, _evt: MouseEvent | KeyboardEvent): void {
        switch (this.openMode) {
            case OpenMode.InsertTemplate: {
                this.plugin.environment.insertFromTemplate(item.template);
                break;
            }
            case OpenMode.CreateFromTemplate: {
                const folder = this.folderLocation;
                this.folderLocation = undefined;
                this.plugin.environment.createFromTemplate(item.template, {
                    openNote: true,
                    folder,
                });
                break;
            }
        }
    }

    async #open() {
        // await this.plugin.environment.invalidate();
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
