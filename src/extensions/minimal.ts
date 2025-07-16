import { alertError } from "utils/alert";
import type { Extension } from "../environment";
import { PochoirError } from "../errors";
import { PathBuilder } from "../path-builder";

export default function (): Extension {
    return (env) => {
        env.loaders.push({
            test: (path) => {
                try {
                    env.cache.resolve(path);
                    return true;
                } catch (e) {
                    if (!(e instanceof PochoirError) && e instanceof Error) {
                        alertError(e);
                    }
                    return false;
                }
            },
            load: async (path, context) => {
                const template = env.cache.resolve(path);
                await context.load(template, env);
                return context.locals.exports;
            },
        });

        env.processors.set("property:render", {
            type: "property",
            order: 100,
            process: async ({ context, key, value }) => {
                const originalPath = new PathBuilder(context.target);
                const valueStr: string = JSON.stringify(value);
                const resStr = await env.renderer.render(valueStr, {
                    originalPath: originalPath.createProxy(),
                    path: context.path.createProxy(),
                    ...context.locals.exports,
                });
                const res = JSON.parse(resStr);
                context.properties.set(key, res);
            },
        });
    };
}
