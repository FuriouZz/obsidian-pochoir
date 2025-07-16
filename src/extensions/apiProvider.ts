import * as obsidian from "obsidian";
import type { Extension } from "../environment";

export default function (): Extension {
    return (env) => {
        env.loaders.push({
            test: /^pochoir:obsidian(\/app)?$/,
            async load(path) {
                if (path.endsWith("/app")) return env.app;
                return obsidian;
            },
        });
    };
}
