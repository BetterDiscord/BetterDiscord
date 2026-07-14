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

        let index = 0;
        for (const listener of this.events[event]) {
            try {
                listener(...args);
            }
            catch (error) {
                Logger.error("Emitter", `Cannot fire listener for event ${event} at position ${index}:`, error);
            }
            index++;
        }
    }

    off(event: string, callback: (...args: any[]) => void) {
        if (!this.events[event]) return;

        return this.events[event].delete(callback);
    }
}