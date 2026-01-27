import { ContentProcessor } from "../content-processor";
import type { Extension } from "../environment";

export default function (): Extension {
    return {
        name: "experimental",
        settings: {
            label: "Experimental",
            desc: "Experimental features",
        },
        setup(env) {
            env.loaders.unshift({
                contextMode: "shared",
                test: "pochoir:content",
                load: ({ context }) => ({
                    // getTemplateContent(cb: (file: Content) => void) {
                    //     content.getTemplateContent.push(cb);
                    // },
                    getTargetContent(cb: (params: unknown) => void) {
                        context.get("content")?.targetProcessor.push(cb);
                    },
                    // getRenderedContent(cb: (file: Content) => void) {
                    //     content.getRenderedContent.push(cb);
                    // },
                }),
            });

            env.contextProviders.push((context) => {
                context.set("content", new ContentProcessor());
            });
        },
    };
}

declare module "../template-context" {
    interface TemplateContextLocals {
        content: ContentProcessor;
    }
}
