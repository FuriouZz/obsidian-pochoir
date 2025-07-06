import { parseYaml } from "obsidian";

export class PropertiesBuilder extends Map<string, unknown> {
  clone() {
    return new PropertiesBuilder(this);
  }

  #findSet(key: string) {
    let set = this.get(key);
    if (!(set instanceof Set)) {
      set = new Set();
      super.set(key, set);
    }
    return set as Set<string>;
  }

  insertTo(key: string, value: string) {
    this.#findSet(key).add(value);
  }

  removeTo(key: string, value: string) {
    const set = this.#findSet(key);
    set.delete(value);
    if (set.size === 0) this.delete(key);
  }

  filter(predicate: (key: string, value: unknown) => boolean) {
    const keys: string[] = [];
    for (const [key, value] of this.entries()) {
      if (!predicate(key, value)) keys.push(key);
    }
    if (keys.length > 0) {
      for (const key of keys) this.delete(key);
    }
  }

  fromObject(obj: object) {
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        for (const item of value) this.insertTo(key, item);
      } else {
        this.set(key, value);
      }
    }
  }

  toObject(fm: Record<string, unknown> = {}) {
    for (const [key, value] of this.entries()) {
      if (value instanceof Set) {
        if (fm[key]) {
          if (Array.isArray(fm[key])) {
            fm[key] = [...(fm[key] as string[]), ...value];
          } else {
            fm[key] = [fm[key], ...value];
          }
        } else {
          fm[key] = [...value];
        }
      } else {
        if (fm[key]) {
          if (Array.isArray(fm[key])) {
            fm[key] = [...(fm[key] as string[]), value];
          } else {
            fm[key] = [fm[key], value];
          }
        } else {
          fm[key] = value;
        }
      }
    }
    return fm;
  }

  fromYaml(yaml: string) {
    this.fromObject(parseYaml(yaml));
  }

  toYaml() {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(this.toObject())) {
      if (Array.isArray(value)) {
        const list = value.map((item) => `  - ${item}`).join("\n");
        lines.push(`${key}:\n${list}`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
    return lines.join("\n");
  }

  createProxy() {
    const proxy = new Proxy(this, {
      get(target, p: string) {
        const value = target.get(p);
        if (value instanceof Set) {
          return [...value];
        }
        return value;
      },
      set(target, p: string, newValue) {
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
