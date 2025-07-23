type EventCallback<T> = (params: T) => void;

export class EventEmitter<T = unknown> {
    #listeners = new Set<EventCallback<T>>();

    on(cb: EventCallback<T>) {
        this.#listeners.add(cb);
        return () => this.off(cb);
    }

    once(cb: EventCallback<T>) {
        const _cb = (params: T) => {
            cb(params);
            this.off(_cb);
        };
        this.#listeners.add(_cb);
        return () => this.off(_cb);
    }

    off(cb: EventCallback<T>) {
        this.#listeners.delete(cb);
    }

    clear() {
        this.#listeners.clear();
    }

    trigger(params: T) {
        for (const listener of this.#listeners) {
            listener(params);
        }
    }

    static join(...cbs: (() => unknown)[]) {
        return () => {
            for (const cb of cbs) cb();
        };
    }
}
