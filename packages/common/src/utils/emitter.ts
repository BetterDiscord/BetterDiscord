import Logger from "./logger";

export default class EventEmitter {
    events: {[event: string]: Set<Function>};
    constructor() {
        this.events = {};
    }

    on(event: string, callback: Function) {
        if (!this.events[event]) this.events[event] = new Set();

        this.events[event].add(callback);
    }

    once(event: string, callback: Function) {
        const wrapped = (...args: any[]) => {
            this.off(event, wrapped);

            return callback(...args);
        };

        this.on(event, wrapped);
    }

    emit(event: string, ...args: any[]) {
        if (!this.events[event]) return;

        for (const [index, listener] of this.events[event].entries()) {
            try {
                listener(...args);
            }
            catch (error) {
                Logger.stacktrace("Emitter", `Cannot fire listener for event ${event} at position ${index}:`, error as Error);
            }
        }
    }

    off(event: string, callback: Function) {
        if (!this.events[event]) return;

        return this.events[event].delete(callback);
    }
}
