export default class RDTFix {
    static #originalType;

    static initialize() {
        this.#originalType = window.$type;
        
        Object.defineProperty(window, "$type", {
            get: () => {
                return this.#originalType;
            },
            set: (v) => {
                this.#originalType = v?.__originalFunction || v;
            },
        });
    }

    static stop() {
        Object.defineProperty(window, "$type", {
            value: () => {
                return this.#originalType;
            },
        });
    }
}