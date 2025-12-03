import type { Extension } from "../environment";
import type { Template } from "../template";

export default function (): Extension {
    return {
        name: "special-properties",
        settings: {
            label: `Enable [Special properties](https://furiouzz.github.io/obsidian-pochoir/special-properties/overview/)`,
            desc: "Use powerful properties to improve your template",
        },
        setup(env) {
            env.processors
                .set("property:imports-template", {
                    type: "property",
                    test: "$.imports",
                    order: 40,
                    async process({ context, value: properties }) {
                        if (!isStringList(properties)) return;
                        for (const t of properties) {
                            const { context: ctx } = await env.importer.load(
                                t,
                                context,
                            );
                            Object.assign(
                                context.locals.exports,
                                ctx.locals.exports,
                            );
                        }
                    },
                })
                .set("property:merge-properties", {
                    type: "property",
                    test: "$.properties",
                    order: 80,
                    async process({ context, value: properties }) {
                        if (!isStringList(properties)) return;
                        for (const t of properties) {
                            const { context: ctx } = await env.importer.load(
                                t,
                                context,
                            );
                            context.properties.merge(ctx.properties);
                        }
                    },
                })
                .set("property:create-path", {
                    type: "property",
                    test: "$.path",
                    order: 110,
                    process({ context, value }) {
                        if (typeof value !== "string") return;
                        const chunks = value.split("/");
                        const name = chunks.pop() as string;
                        const parent = chunks.join("/");
                        const [basename, extension = "md"] = name.split(".");
                        context.path.basename = basename;
                        context.path.extension = extension;
                        context.path.parent = parent;
                    },
                })
                .set("property:delete-internals", {
                    type: "property",
                    test: /^\$\./,
                    order: 120,
                    process({ context, key }) {
                        context.properties.delete(key);
                    },
                });

            env.templateSuggesters.add({
                getSuggestions({ suggester, query }) {
                    if (!query.startsWith("@")) return;
                    const q = query.slice(1);
                    return suggester
                        .getItems()
                        .map((entry) => {
                            const aliases = getAliases(entry.template);
                            return aliases?.map((alias) => {
                                const { matches, score } =
                                    suggester.createSearchMatches(
                                        alias.toLowerCase(),
                                        q.toLowerCase(),
                                    );

                                return {
                                    item: {
                                        type: "alias",
                                        template: entry.template,
                                        title: alias,
                                        subtitle:
                                            entry.template.getDisplayName(),
                                    },
                                    match: {
                                        matches,
                                        score,
                                    },
                                };
                            });
                        })
                        .filter((entry) => !!entry)
                        .flat()
                        .sort((a, b) => b.match.score - a.match.score);
                },
            });
        },
    };
}

function isStringList(a: unknown): a is string[] {
    return Array.isArray(a);
}

function getAliases(template: Template): string[] | undefined {
    const aliases = template.info.properties.get("$.aliases");
    if (!Array.isArray(aliases)) return undefined;
    return aliases;
}
