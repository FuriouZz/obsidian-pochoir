import type { Extension } from "../environment";

export default function (): Extension {
    return {
        name: "experimental",
        settings: {
            label: "Experimental",
            desc: "Experimental features",
        },
        setup(env) {
            class Content {
                #content: string = "";

                constructor(content: string) {
                    this.#content = content;
                }

                get() {
                    return this.#content;
                }

                lines() {
                    return this.#content.split("\n");
                }

                transformByLine(
                    cb: (
                        line: string,
                        index: number,
                    ) => string | string[] | false,
                ) {
                    return this.lines()
                        .map((line, index) => {
                            const result = cb(line, index);
                            if (result === false) return false;
                            return Array.isArray(result)
                                ? result.join("\n")
                                : result;
                        })
                        .filter((line) => line !== false)
                        .join("\n");
                }

                update(content: string) {
                    this.#content = content;
                }
            }

            const content = {
                getTemplateContent: [] as ((file: Content) => void)[],
                getTargetContent: [] as ((file: Content) => void)[],
                getRenderedContent: [] as ((file: Content) => void)[],
            };

            env.loaders.unshift({
                contextMode: "shared",
                test: "pochoir:content",
                load: ({ context }) => ({
                    getTemplateContent(cb: (file: Content) => void) {
                        content.getTemplateContent.push(cb);
                    },
                    getTargetContent(cb: (params: unknown) => void) {
                        console.log("cool", context.id);
                        context.content.targetProcessor.push(cb);
                        // content.getTargetContent.push(cb);
                    },
                    getRenderedContent(cb: (file: Content) => void) {
                        content.getRenderedContent.push(cb);
                    },
                }),
            });
        },
    };
}
