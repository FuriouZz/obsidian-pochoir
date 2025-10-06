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
                order: 30,
                languages: {
                    "pochoir-snippet": "md",
                },
                async preprocess({ codeBlock, template: parent }) {
                    const identifier = `${parent.info.file.path}#${codeBlock.id}`;
                    const displayName =
                        (codeBlock.attributes.title as string) ||
                        (codeBlock.attributes.name as string) ||
                        identifier;

                    const template = await env.createVirtualTemplate({
                        type: "source",
                        source: codeBlock.code,
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
