import { parseYaml } from "obsidian";

export default class FrontmatterBuilder extends Map<string | symbol, unknown> {
	#findSet(key: string | symbol) {
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

	fromObject(obj: object) {
		for (const [key, value] of Object.entries(obj)) {
			this.set(key, value);
		}
	}

	fromYaml(yaml: string) {
		this.fromObject(parseYaml(yaml));
	}

	toObject() {
		const obj: Record<string | symbol, unknown> = {};
		for (const [key, value] of this.entries()) {
			if (value instanceof Set) {
				obj[key] = [...value];
			} else {
				obj[key] = value;
			}
		}
		return obj;
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
			get(target, p) {
				console.log(p);
				if (p === "$builder") return target;
				return target.get(p);
			},
			set(target, p, newValue) {
				target.set(p, newValue);
				return true;
			},
			deleteProperty(target, p) {
				target.delete(p);
				return true;
			},
			has(target, p) {
				return target.has(p);
			},
			ownKeys(target) {
				return [...target.keys()];
			},
			getOwnPropertyDescriptor(target, p) {
				return {
					configurable: true,
					enumerable: true,
					writable: true,
					value: target.get(p),
				};
			},
		});

		return proxy as Record<string, unknown> & { $builder: FrontmatterBuilder };
	}
}
