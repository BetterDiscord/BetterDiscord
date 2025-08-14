export default abstract class Store {
    static stores = new Set<Store>();
    static getStore<T extends Store = Store>(name: string) {
        for (const store of Store.stores) {
          if (Store.prototype.getName.call(store) === name) return store as T;
        }
    }


    constructor() {
        Store.stores.add(this);
    }

    initialize(): void {};

    displayName?: string;
    getName() {
        if (this.displayName) return this.displayName;
        return this.constructor.name;
    }


    #listeners = new Set<() => void>();
    addChangeListener(callback: () => void) {
        this.#listeners.add(callback);
        return () => this.removeChangeListener(callback);
    }

    removeChangeListener(callback: () => void) {
        this.#listeners.delete(callback);
    }

    emit() {
        for (const listener of this.#listeners) {
            listener();
        }
    }
}