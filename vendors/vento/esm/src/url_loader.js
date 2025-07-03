import "../_dnt.polyfills.js";
import { posix } from "../deps.js";
export class UrlLoader {
    #root;
    constructor(root) {
        this.#root = root;
    }
    async load(file) {
        const url = new URL(posix.join(this.#root.pathname, file), this.#root);
        const source = await (await fetch(url)).text();
        return { source };
    }
    resolve(from, file) {
        if (file.startsWith(".")) {
            return posix.join("/", posix.dirname(from), file);
        }
        return posix.join("/", file);
    }
}
