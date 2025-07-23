import type { Extension } from "../environment";

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
                    async process({ context, value }) {
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
                    async process({ context, key }) {
                        context.properties.delete(key);
                    },
                });
        },
    };
}

function isStringList(a: unknown): a is string[] {
    return Array.isArray(a);
}
