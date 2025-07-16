import type { TemplateContext } from "./template";
import { alertError } from "./utils/alert";

export type Resolver<TResult = unknown> = {
    resolve: (path: string) => boolean;
    load(path: string, context: TemplateContext): Promise<TResult>;
};

export class Importer {
    resolvers: Resolver[] = [];

    resolve(path: string) {
        for (const resolver of this.resolvers) {
            try {
                const result = resolver.resolve(path);
                if (result) {
                    return {
                        load: (ctx: TemplateContext) => {
                            return resolver.load(path, ctx);
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
