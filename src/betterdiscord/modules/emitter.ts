import EventEmitter from "events";

export default new class BDEvents extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20);
    }

    dispatch(eventName: string, ...args: any[]) {
        this.emit(eventName, ...args);
    }
};