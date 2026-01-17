import { toSlug } from "@furiouzz/lol/string/string";
import type { Extension } from "../environment";

export default function (): Extension {
    return {
        name: "snippet",
        settings: {
            label: "Enable [pochoir-snippet](https://furiouzz.github.io/obsidian-pochoir/snippet/) code block",
            desc: "Instead of creating a template by file, use a code block",
        },
        setup(env) {
            env.processors.set("codeblock:snippet", {
                type: "codeblock",
                languages: {
                    "pochoir-snippet": "md",
                },
                async preprocess({ codeBlock, template: parent }) {
                    const displayName =
                        (codeBlock.attributes.title as string) ||
                        (codeBlock.attributes.name as string) ||
                        `${parent.info.file.path}#${codeBlock.id}`;

                    const id =
                        (codeBlock.attributes.id ?? codeBlock.attributes.title)
                            ? toSlug(codeBlock.attributes.title as string)
                            : codeBlock.attributes.name
                              ? toSlug(codeBlock.attributes.name as string)
                              : codeBlock.id;

                    const identifier = `${parent.info.file.path}#${id}`;

                    const template = await env.createVirtualTemplate({
                        type: "source",
                        source: codeBlock.code,
                        options: { canProcess: false },
                    });

                    if (!template) return;

                    template.info.identifier = identifier;
                    template.info.displayName = displayName;

                    env.cache.add(template);
                },
            });

            env.templateSuggesters.add({
                getItems({ items }) {
                    return items.map((item) => ({
                        ...item,
                        subtitle: item.template.isSnippet()
                            ? "Snippet"
                            : item.subtitle,
                    }));
                },

                getSuggestions({ suggester, query }) {
                    if (!query.startsWith("#")) return;

                    const q = query.slice(1);
                    return suggester
                        .getItems()
                        .filter((item) => item.template.isSnippet())
                        .map((entry) => {
                            const { matches, score } =
                                suggester.createSearchMatches(
                                    entry.title.toLowerCase(),
                                    q.toLowerCase(),
                                );

                            return {
                                item: {
                                    type: "snippet",
                                    template: entry.template,
                                    title: entry.title,
                                    subtitle: entry.template.info.file.basename,
                                },
                                match: {
                                    matches,
                                    score,
                                },
                            };
                        })
                        .sort((a, b) => b.match.score - a.match.score);
                },
            });
        },
    };
}
