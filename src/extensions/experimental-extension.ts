import { ContentProcessor } from "../content-processor";
import type { Extension } from "../environment";

const ContentExtension: Extension["setup"] = (env) => {
    env.loaders.unshift({
        contextMode: "shared",
        test: "pochoir:content",
        load: ({ context }) => ({
            getTemplateContent(cb: (params: unknown) => void) {
                context.get("content")?.templateProcessor.push(cb);
            },
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
};

export default function (): Extension {
    return {
        name: "experimental",
        settings: {
            label: "Experimental",
            desc: "Experimental features",
        },
        setup(env) {
            ContentExtension(env);
        },
    };
}

declare module "../template-context" {
    interface TemplateContextLocals {
        content: ContentProcessor;
    }
}
