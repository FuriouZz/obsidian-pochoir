import type { Extension } from "../environment";
import { LOGGER } from "../logger";
import { PathBuilder } from "../path-builder";
import { parseYaml } from "../utils/obsidian";

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
                languages: {
                    "pochoir-props": "yaml",
                    "pochoir-properties": "yaml",
                },
                preprocess({ codeBlock, template }) {
                    try {
                        if (!codeBlock.attributes.noclear) {
                            template.info.properties.clear();
                        }
                        const json = parseYaml<object>(codeBlock.code) ?? {};
                        template.info.properties.merge(json);
                    } catch (e) {
                        LOGGER.warn(e);
                    }
                },
                async process({ context, codeBlock }) {
                    if (!codeBlock.attributes.noclear) {
                        context.properties.clear();
                    }
                    const originalPath = new PathBuilder().fromBuilder(
                        context.path,
                    );
                    const yaml = await env.renderer.render(codeBlock.code, {
                        originalPath: originalPath.createProxy(),
                        path: context.path.createProxy(),
                        ...context.exports,
                    });
                    context.properties.merge(parseYaml<object>(yaml) ?? {});
                },
            });
        },
    };
}
