import EventEmitter from "../../../common/events";

export default new class BDEvents extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20);
    }

    addListener() {
        return this.on.apply(this, arguments);
    }

    removeListener() {
        return this.off.apply(this, arguments);
    }

    dispatch(eventName, ...args) {
        this.emit(eventName, ...args);
    }
};
