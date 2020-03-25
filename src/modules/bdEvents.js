/* BDEvents */
const EventEmitter = require("events");
export default new class BDEvents extends EventEmitter {
    dispatch(eventName, ...args) {this.emit(eventName, ...args);}
    off(eventName, eventAction) {this.removeListener(eventName, eventAction);}
};