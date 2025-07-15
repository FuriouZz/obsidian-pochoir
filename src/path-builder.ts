import { TAbstractFile, TFile } from "obsidian";

export class PathBuilder {
    #basename = "";
    #extension = "";
    #parent = "";
    #path = "";
    hasChanged = false;

    constructor(path: string | TAbstractFile = "") {
        if (path instanceof TAbstractFile) {
            this.fromTFile(path);
        }
    }

    get name() {
        return `${this.#basename}.${this.#extension}`;
    }

    set name(value: string) {
        const [basename, extension] = value.split(".");
        this.#basename = basename;
        this.#extension = extension;
        this.#updatePath();
    }

    get basename() {
        return this.#basename;
    }

    set basename(value: string) {
        this.#basename = value;
        this.#updatePath();
    }

    get extension() {
        return this.#extension;
    }

    set extension(value: string) {
        this.#extension = value;
        this.#updatePath();
    }

    get parent() {
        return this.#parent;
    }

    set parent(parent: string) {
        this.#parent = parent;
        this.#updatePath();
    }

    get path() {
        return this.#path;
    }

    set path(path: string) {
        const parts = path
            .trim()
            .replace(/^(\/|\.\/)/, "")
            .split("/");

        const name = parts.pop() as string;
        const extension = name.match(/(\.[a-z0-9-_]*)$/i)?.[0] ?? "";
        const basename = name.replace(/(\.[a-z0-9-_]*)$/i, "");

        this.#basename = basename;
        this.#extension = extension.replace(".", "");
        this.#parent = parts.join("/");

        this.#updatePath();
    }

    #updatePath() {
        if (this.#parent) {
            this.#path = `${this.#parent}/${this.basename}.${this.extension}`;
        } else {
            this.#path = `${this.basename}.${this.extension}`;
        }
        this.#path = this.#path.replace(/^(\/|\.\/)*/, "");
        this.hasChanged = true;
    }

    fromTFile(tfile: TAbstractFile) {
        if (tfile instanceof TFile) {
            this.#basename = tfile.basename;
            this.#extension = tfile.extension;
        }
        this.#parent = tfile.parent?.path ?? "";
        this.hasChanged = false;
    }

    createProxy() {
        const accessors = ["name", "basename", "extension", "parent", "path"];
        return new Proxy(this, {
            get(target, p) {
                if (typeof p === "string" && accessors.includes(p)) {
                    return Reflect.get(target, p);
                }
            },
            set(target, p, value) {
                if (typeof p === "string" && accessors.includes(p)) {
                    Reflect.set(target, p, value);
                    return true;
                }
                return false;
            },
            ownKeys() {
                return accessors;
            },
            deleteProperty() {
                return false;
            },
            has(_, p) {
                return typeof p === "string" && accessors.includes(p);
            },
        });
    }
}
