import {
    type App,
    type CachedMetadata,
    type EventRef,
    type TAbstractFile,
    TFile,
} from "obsidian";
import { EventEmitter } from "./event-emitter";
import { getFilesAtLocation } from "./utils/obsidian";

export type FileWatcherEvent =
    | {
          name: "change";
          path: string;
          metadata: CachedMetadata;
      }
    | {
          name: "delete";
          path: string;
      };

export class FileWatcher {
    #refs: EventRef[] = [];
    #files = new Set<string>();
    #metadatas = new Map<string, CachedMetadata>();
    #folder: string = "";
    app: App;

    events = new EventEmitter<FileWatcherEvent>();

    constructor(app: App) {
        this.app = app;
    }

    setFolder(value: string | undefined) {
        this.#folder = value ?? "";
        this.refresh({ force: true });
    }

    get metadatas() {
        return this.#metadatas;
    }

    enable() {
        if (this.#refs.length > 0) this.disable();

        this.#refs.push(
            this.app.metadataCache.on("resolved", () => this.refresh()),
            this.app.vault.on("create", this.#onChange),
            this.app.vault.on("modify", this.#onChange),
            this.app.vault.on("delete", this.#onDelete),
            this.app.vault.on("rename", this.#onRename),
        );

        this.refresh({ force: true });

        return () => this.disable();
    }

    disable() {
        for (const ref of this.#refs) {
            this.app.vault.offref(ref);
        }
        this.#refs.length = 0;
    }

    #isValidFile = (file: TAbstractFile, path = file.path): file is TFile => {
        return file instanceof TFile && path.startsWith(this.#folder);
    };

    #updateEntry = (path: string) => {
        this.#files.add(path);
        const meta = this.app.metadataCache.getCache(path);
        if (meta) {
            const oldmeta = this.#metadatas.get(path);
            if (oldmeta !== meta) {
                this.#metadatas.set(path, meta);
                return { path, metadata: meta };
            }
        }
        return false;
    };

    #deleteEntry = (path: string) => {
        const valid = this.#files.has(path) && this.#metadatas.has(path);
        this.#files.delete(path);
        this.#metadatas.delete(path);
        return valid;
    };

    #onChange = (file: TAbstractFile, path = file.path) => {
        const entry = this.#isValidFile(file) && this.#updateEntry(path);
        if (entry) this.events.trigger({ name: "change", ...entry });
    };

    #onDelete = (file: TAbstractFile, path = file.path) => {
        if (this.#isValidFile(file, path) && this.#deleteEntry(path)) {
            this.events.trigger({ name: "delete", path: path });
        }
    };

    #onRename = (file: TAbstractFile, oldpath: string) => {
        this.#onChange(file);
        this.#onDelete(file, oldpath);
    };

    refresh({ force = false }: { force?: boolean } = {}) {
        if (force) {
            this.#files.clear();
            this.#metadatas.clear();
            for (const file of getFilesAtLocation(this.app, this.#folder)) {
                this.#onChange(file);
            }
        } else {
            for (const path of this.#files) {
                const file = this.app.vault.getFileByPath(path);
                if (file) this.#onChange(file);
            }
        }
    }
}
