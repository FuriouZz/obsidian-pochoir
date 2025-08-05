import type { Extension } from "../environment";
import { PropertiesBuilder } from "../properties-builder";
import { Template } from "../template";

export default function (): Extension {
    return {
        name: "snippet",
        settings: {
            label: "Enable [pochoir-snippet](https://furiouzz.github.io/obsidian-pochoir/snippet/overview/) code block",
            desc: "Instead of creating a template by file, use a code block",
        },
        setup(env) {
            env.preprocessors.set("codeblock:snippet", {
                type: "codeblock",
                order: 130,
                languages: {
                    "pochoir-snippet": "md",
                },
                async process({ codeBlock, template: parent }) {
                    const identifier = `${parent.info.file.path}#${codeBlock.id}`;
                    const displayName =
                        (codeBlock.attributes.title as string) ||
                        (codeBlock.attributes.name as string) ||
                        identifier;

                    const template = new Template({
                        codeBlocks: [],
                        contentRanges: [[0, codeBlock.code.length]],
                        file: parent.info.file,
                        properties: new PropertiesBuilder(),
                        source: codeBlock.code,
                        displayName,
                        identifier,
                    });

                    env.cache.add(template);
                },
            });
        },
    };
}
