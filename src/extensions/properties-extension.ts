import type { Extension } from "../environment";
import { PathBuilder } from "../path-builder";

export default function (): Extension {
    return {
        name: "properties",
        settings: {
            label: "Enable [pochoir-props](https://furiouzz.github.io/obsidian-pochoir/properties/overview/) code block",
            desc: "Instead of using template properties, use a code block",
        },
        setup(env) {
            env.processors.set("codeblock:properties", {
                type: "codeblock",
                order: 99,
                languages: {
                    "pochoir-props": "yaml",
                    "pochoir-properties": "yaml",
                },
                async process({ context, codeBlock }) {
                    context.properties.clear();
                    const originalPath = new PathBuilder(context.target);
                    const yaml = await env.renderer.render(codeBlock.code, {
                        originalPath: originalPath.createProxy(),
                        path: context.path.createProxy(),
                        ...context.locals.exports,
                    });
                    console.log(yaml);
                    context.properties.mergeYaml(yaml);
                },
            });
        },
    };
}
