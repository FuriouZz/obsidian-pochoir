import { parseYaml } from "./utils/obsidian";

type AcceptedValue = string | string[];

export class PropertiesBuilder extends Map<string, AcceptedValue> {
    clone() {
        return new PropertiesBuilder(this);
    }

    #findArray(key: string) {
        let set = this.get(key);
        if (!Array.isArray(set)) {
            set = [];
            super.set(key, set);
        }
        return set;
    }

    list(key: string) {
        const set = this.get(key);
        if (!Array.isArray(set)) return null;
        return set;
    }

    insertTo(key: string, ...values: string[]) {
        const set = this.#findArray(key);
        for (const value of values) {
            if (!set.includes(value)) set.push(value);
        }
        return this;
    }

    removeTo(key: string, ...values: string[]) {
        const set = this.#findArray(key);
        for (const value of values) {
            const index = set.indexOf(value);
            if (index > -1) set.splice(index, 1);
        }
        if (set.length === 0) this.delete(key);
        return this;
    }

    set(key: string, value: AcceptedValue | Set<string>) {
        if (Array.isArray(value) || value instanceof Set) {
            return this.insertTo(key, ...value);
        }
        return super.set(key, value);
    }

    filter(predicate: (key: string, value: AcceptedValue) => boolean) {
        const builder = new PropertiesBuilder();
        for (const [key, value] of this.entries()) {
            if (!predicate(key, value)) builder.set(key, value);
        }
        return builder;
    }

    merge(obj: string | object | PropertiesBuilder) {
        if (typeof obj === "string") {
            return this.mergeYaml(obj);
        }

        const entries =
            obj instanceof PropertiesBuilder
                ? obj.entries()
                : Object.entries(obj);

        for (const [key, value] of entries) {
            this.set(key, value as AcceptedValue);
        }

        return this;
    }

    mergeYaml(yaml: string) {
        const json = parseYaml(yaml);
        if (typeof json !== "object" || json === null) {
            throw new Error(
                "Failed to merge YAML. Check the console for more information.",
            );
        }
        this.merge(json);
        return this;
    }

    toObject(fm: Record<string, unknown> = {}) {
        const isIterable = (value: unknown): value is Iterable<unknown> => {
            return Array.isArray(value) || value instanceof Set;
        };

        for (const [key, value] of this.entries()) {
            if (isIterable(value) || isIterable(fm[key])) {
                fm[key] = fm[key] || [];
                fm[key] = [fm[key], value].flat().unique();
            } else {
                fm[key] = value;
            }
        }

        return fm;
    }

    toYAML() {
        const isIterable = (value: unknown): value is Iterable<unknown> => {
            return Array.isArray(value) || value instanceof Set;
        };

        let str = "";

        for (const [key, value] of this.entries()) {
            if (isIterable(value)) {
                const v = [...value]
                    .map((v) => `- ${JSON.stringify(v)}`)
                    .join("\n");
                str += `${key}: \n${v}\n`;
            } else {
                str += `${key}: ${JSON.stringify(value)}\n`;
            }
        }

        return `---\n${str.trim()}\n---`;
    }

    createProxy() {
        const proxy = new Proxy(this, {
            get(target, p: string) {
                if (p.startsWith("$")) {
                    const value = Reflect.get(target, p.slice(1));
                    if (typeof value === "function") {
                        return value.bind(target) as () => unknown;
                    }
                    return value as unknown;
                }
                const value = target.get(p);
                if (value instanceof Set) {
                    return [...value] as string[];
                }
                return value;
            },
            set(target, p: string, newValue: AcceptedValue) {
                target.set(p, newValue);
                return true;
            },
            deleteProperty(target, p: string) {
                target.delete(p);
                return true;
            },
            has(target, p: string) {
                return target.has(p);
            },
            ownKeys(target) {
                return [...target.keys()];
            },
            getPrototypeOf(_target) {
                return null;
            },
            getOwnPropertyDescriptor(target, p: string) {
                return {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: target.get(p),
                };
            },
        });

        return proxy as Record<string, unknown>;
    }
}
