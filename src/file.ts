import type { TFile } from "obsidian";

export class FileBuilder {
  #title = "Untitled";
  #extension = "md";
  #parent = "";
  #path = "";
  hasChanged = true;

  get title() {
    return this.#title;
  }

  set title(title: string) {
    this.#title = title;
    this.#updatePath();
  }

  get extension() {
    return this.#extension;
  }

  set extension(extension: string) {
    this.#extension = extension;
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

  // set path(path: string) {
  //   const parts = path
  //     .trim()
  //     .replace(/^(\/|\.\/)/, "")
  //     .split("/");

  //   const name = parts.pop() as string;
  //   const extension = name.match(/(\.[a-z0-9-_]*)$/i)?.[0] ?? "";
  //   const basename = name.replace(/(\.[a-z0-9-_]*)$/i, "");

  //   this.#title = basename;
  //   this.#extension = extension.replace(".", "");
  //   this.#parent = parts.join("/");
  //   this.#updatePath();
  // }

  compose(
    parts: Partial<{ title: string; parent: string; extension: string }> = {},
  ) {
    this.#parent = parts.parent ?? this.parent;
    this.#title = parts.title ?? this.title;
    this.#extension = parts.extension ?? this.extension;
    this.#updatePath();
  }

  #updatePath() {
    this.#path = `${this.parent}/${this.title}.${this.extension}`;
    this.#path = this.#path.replace(/^(\/|\.\/)*/, "");
    this.hasChanged = true;
  }

  fromTFile(tfile: TFile) {
    this.#title = tfile.basename;
    this.#extension = tfile.extension;
    this.#parent = tfile.parent?.path ?? "/";
    this.#path = tfile.path;
    this.hasChanged = false;
  }
}
