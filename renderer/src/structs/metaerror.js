export default class MetaError extends Error {
    constructor(message) {
        super(message);
        this.name = "MetaError";
    }
}