export default class AddonError<T extends {message?: string, stack?: string;} = {message?: string, stack?: string;}> extends Error {
    file: string;
    error: T;
    type: string;
    constructor(name: string, filename: string, message: string, error: T, type: string) {
        super(message);
        this.name = name;
        this.file = filename;
        this.error = error;
        this.type = type;
    }
}