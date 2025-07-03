import "../_dnt.polyfills.js";
import path from "node:path";
import fs from "node:fs/promises";
import process from "node:process";
export class FileLoader {
    #root;
    constructor(root = process.cwd()) {
        this.#root = root;
    }
    async load(file) {
        return {
            source: await fs.readFile(file, { encoding: "utf-8" }),
        };
    }
    resolve(from, file) {
        if (file.startsWith(".")) {
            return path.join(path.dirname(from), file);
        }
        if (file.startsWith(this.#root)) {
            return file;
        }
        return path.join(this.#root, file);
    }
}
