import * as obsidian from "obsidian";
import type { Extension } from "../environment";
import { ContentProcessor } from "./content-extension/content-processor";

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

const ObsidianExtension: Extension["setup"] = (env) => {
    env.loaders.unshift({
        contextMode: "shared",
        test: "pochoir:app",
        load: () => env.app,
    });
    env.loaders.unshift({
        contextMode: "shared",
        test: "pochoir:obsidian",
        load: () => obsidian,
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
            ObsidianExtension(env);
        },
    };
}

declare module "../template-context" {
    interface TemplateContextLocals {
        content: ContentProcessor;
    }
}
