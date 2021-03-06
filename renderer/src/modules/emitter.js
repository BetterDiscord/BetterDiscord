const EventEmitter = require("events");

export default new class BDEvents extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20);
    }

    dispatch(eventName, ...args) {
        this.emit(eventName, ...args);
    }
};