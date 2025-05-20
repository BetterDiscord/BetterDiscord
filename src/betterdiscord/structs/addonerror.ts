export default class AddonError extends Error {
    file: string;
    error: Error;
    type: string;
    constructor(name: string, filename: string, message: string, error: Error, type: string) {
        super(message);
        this.name = name;
        this.file = filename;
        this.error = error;
        this.type = type;
    }
}