import type { Extension } from "../environment";

type Fn<T> = () => (...parameters: unknown[]) => Promise<T>;

function createAsyncFunction<T = unknown>(
    code: string,
    ...parameters: string[]
) {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- necessary to evaluate javascript blocks
    const ctor = new Function(`return async function(${parameters.join(",")}) {
        ${code}
    }`) as Fn<T>;
    return ctor();
}

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
                async process({ codeBlock, context, template }) {
                    const fn = createAsyncFunction(codeBlock.code, "template");
                    await fn({
                        ...context.locals,
                        async import(path: string) {
                            const { result } = await env.importer.load(
                                path,
                                context,
                                template,
                            );
                            return result;
                        },
                        abort() {
                            env.abortTemplate();
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
