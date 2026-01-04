export default abstract class Store {
    public initialize(): void {}

    #listeners = new Set<() => void>();
    public addChangeListener(callback: () => void) {
        this.#listeners.add(callback);
        return () => this.removeChangeListener(callback);
    }

    public removeChangeListener(callback: () => void) {
        this.#listeners.delete(callback);
    }

    public emitChange() {
        for (const listener of this.#listeners) {
            listener();
        }
    }
}

Object.freeze(Store);
Object.freeze(Store.prototype);