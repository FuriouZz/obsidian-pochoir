import type { Extension } from "../environment";
import { createAsyncFunction } from "../utils/function";

export default function (): Extension {
    return (env) => {
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
        });
    };
}
