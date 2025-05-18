import Logger from "./logger";


export default class EventEmitter {
    static get EventEmitter() {return EventEmitter;}

    events: Record<string, Set<(...args: any[]) => void>> = {};

    setMaxListeners() {}

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.events[event]) this.events[event] = new Set();

        this.events[event].add(callback);
    }

    emit(event: string, ...args: any[]) {
        if (!this.events[event]) return;

        for (const [index, listener] of this.events[event].entries()) {
            try {
                listener(...args);
            }
            catch (error) {
                Logger.error("Emitter", `Cannot fire listener for event ${event} at position ${index}:`, error);
            }
        }
    }

    off(event: string, callback: (...args: any[]) => void) {
        if (!this.events[event]) return;

        return this.events[event].delete(callback);
    }
}