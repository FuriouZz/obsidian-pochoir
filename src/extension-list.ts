import type { Environment, Extension } from "./environment";

export class ActivationSet extends Set<string> {
    toggle(name: string, enabled = !this.has(name)) {
        if (enabled) this.add(name);
        else this.delete(name);
        return this;
    }

    join(list: Iterable<string>) {
        for (const item of list) {
            if (item.startsWith("-")) {
                this.delete(item.replace(/^-/, ""));
            } else {
                this.add(item);
            }
        }
    }
}

export class ExtensionList extends Map<string, Extension> {
    enabled = new ActivationSet();

    use(extension: Extension) {
        this.set(extension.name, extension);
        return this;
    }

    run(env: Environment) {
        env.cleanup();
        for (const ext of this.values()) {
            if (this.enabled.has(ext.name)) {
                ext.setup(env);
            }
        }
    }
}
