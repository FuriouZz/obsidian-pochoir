import { TemplateContext } from "./template";
import { alertError } from "./utils/alert";

export type Loader<TResult = unknown> = {
    contextMode?: "shared" | "isolated";
    test: string | RegExp | ((path: string) => boolean);
    load(path: string, context: TemplateContext): Promise<TResult>;
};

export class Importer {
    loaders: Loader[];

    constructor(options: { loaders: Loader[] }) {
        this.loaders = options.loaders;
    }

    resolve(path: string) {
        for (const resolver of this.loaders) {
            try {
                let isValid = false;
                if (typeof resolver.test === "string") {
                    isValid = resolver.test === path;
                } else if (resolver.test instanceof RegExp) {
                    isValid = resolver.test.test(path);
                } else if (typeof resolver.test === "function") {
                    isValid = resolver.test(path);
                }

                if (isValid) {
                    return {
                        load: async (ctx: TemplateContext) => {
                            const mode = resolver.contextMode ?? "isolated";
                            const context =
                                mode === "shared"
                                    ? ctx
                                    : new TemplateContext(ctx.target);
                            const result = await resolver.load(path, context);
                            return { context, result };
                        },
                    };
                }
            } catch (e) {
                alertError(e as Error);
            }
        }
        throw new Error(`Cannot resolve path: ${path}`);
    }

    load(path: string, context: TemplateContext) {
        return this.resolve(path).load(context);
    }
}
