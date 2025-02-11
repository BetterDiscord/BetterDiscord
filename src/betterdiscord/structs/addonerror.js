export default class AddonError extends Error {
    constructor(name, filename, message, error, type) {
        super(message);
        this.name = name;
        this.file = filename;
        this.error = error;
        this.type = type;
    }
}