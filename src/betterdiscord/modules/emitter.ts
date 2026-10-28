import EventEmitter from "events";

class BDEvents extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20);
    }

    dispatch(eventName: string, ...args: any[]) {
        this.emit(eventName, ...args);
    }
}

export default new BDEvents();