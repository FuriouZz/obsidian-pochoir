import type { Extension } from "../environment";
import { createAsyncFunction } from "../utils/function";

export default function (): Extension {
    return (env) => {
        env.processors.set("codeblock:javascript", {
            type: "codeblock",
            test: /js|javascript/,
            order: 50,
            process: async ({ codeBlock, context }) => {
                const fn = createAsyncFunction(codeBlock.code, "template");
                await fn({
                    ...context.locals,
                    import(path: string) {
                        const ctx = env.createContext(context.target);
                        return env.importer.load(path, ctx);
                    },
                });
            },
        });
    };
}
