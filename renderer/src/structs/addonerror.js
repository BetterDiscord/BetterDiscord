export default class AddonError extends Error {
    constructor(name, filename, message, error) {
        super(message);
        this.name = name;
        this.file = filename;
        this.error = error;
    }
}