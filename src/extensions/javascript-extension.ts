import type { Extension } from "../environment";
import { createAsyncFunction } from "../utils/function";

export default function (): Extension {
    return {
        name: "javascript",
        settings: {
            label: "Enable [pochoir-js](https://furiouzz.github.io/obsidian-pochoir/javascript/overview/) code block",
            desc: "Use Javascript for more complex template or expose new functions",
        },
        setup(env) {
            env.processors.set("codeblock:javascript", {
                type: "codeblock",
                languages: {
                    "pochoir-js": "javascript",
                    "pochoir-javascript": "javascript",
                },
                order: 50,
                async process({ codeBlock, context }) {
                    const fn = createAsyncFunction(codeBlock.code, "template");
                    await fn({
                        ...context.locals,
                        async import(path: string) {
                            const { result } = await env.importer.load(
                                path,
                                context,
                            );
                            return result;
                        },
                    });
                },
                suggestions: [
                    { suggestion: "template.path.path" },
                    { suggestion: "template.path.parent" },
                    { suggestion: "template.path.name" },
                    { suggestion: "template.path.basename" },
                    { suggestion: "template.path.extension" },
                    {
                        suggestion: "template.properties.$insertTo",
                    },
                    { suggestion: "template.properties.{key}" },
                    // TODO: provide a way to add suggestion here
                    ...["pochoir:form", "pochoir:date", "{import}"].map(
                        (name) => ({
                            suggestion: `await template.import("${name}")`,
                            trigger: `template.import("${name}")`,
                            display: `template.import("${name}")`,
                        }),
                    ),
                ],
            });
        },
    };
}
