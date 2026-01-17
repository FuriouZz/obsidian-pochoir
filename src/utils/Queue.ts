export class Queue<T> {
    #priorities: number[] = [];
    #entries: T[] = [];

    add(value: T, priority = 0) {
        let index = this.indexOf(value);

        if (index === -1) {
            index = this.#entries.length;
            this.#entries.push(value);
        }

        this.#priorities[index] = priority;
    }

    has(value: T) {
        return this.indexOf(value) > -1;
    }

    indexOf(value: T) {
        return this.#entries.indexOf(value);
    }

    delete(...values: T[]) {
        for (const value of values) {
            const index = this.indexOf(value);
            if (index > -1) {
                this.#entries.splice(index, 1);
                this.#priorities.splice(index, 1);
            }
        }
    }

    clear() {
        this.#priorities.length = 0;
        this.#entries.length = 0;
    }

    getPriority(value: T) {
        const index = this.indexOf(value);
        if (index === -1) return -1;
        return this.#priorities[index];
    }

    setPriority(value: T, priority: number) {
        this.add(value, priority);
    }

    reorder(priorities: (T | [T, number])[]) {
        const _priorities: [T, number][] = priorities.map(
            (valueOrValuePriority, index) => {
                return Array.isArray(valueOrValuePriority)
                    ? [valueOrValuePriority[0], valueOrValuePriority[1]]
                    : ([valueOrValuePriority, index] as const);
            },
        );

        for (const [item, priority] of _priorities) {
            this.setPriority(item, priority);
        }
    }

    [Symbol.iterator]() {
        return this.values();
    }

    *values() {
        const order = this.#entries
            .map((_, index) => index)
            .sort((a, b) => this.#priorities[a] - this.#priorities[b]);

        for (const index of order) {
            yield this.#entries[index];
        }
    }
}
