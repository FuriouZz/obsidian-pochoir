import * as obsidian from "obsidian";
import type { Extension } from "../environment";

export default function (): Extension {
    return (env) => {
        const paths = ["pochoir:obsidian", "pochoir:obsidian/app"];
        env.resolvers.push({
            resolve: (path) => paths.includes(path),
            async load(path) {
                if (path.endsWith("/app")) return env.app;
                return obsidian;
            },
        });
    };
}
