export interface ErrorInfo {
    message?: string;
    stack?: string;
}

export default class AddonError extends Error {
    file: string;
    error: ErrorInfo;
    type: string;
    constructor(name: string, filename: string, message: string, error: ErrorInfo, type: string) {
        super(message);
        this.name = name;
        this.file = filename;
        this.error = error;
        this.type = type;
    }
}