import type * as https from "node:https";

export interface DialogOptions {
    mode: "open" | "save";
    defaultPath: string;
    filters: Array<Record<string, string[]>>;
    title: string;
    message: string;
    showOverwriteConfirmation: boolean;
    showHiddenFiles: boolean;
    promptToCreate: boolean;
    openDirectory: boolean;
    openFile: boolean;
    multiSelections: boolean;
    modal: boolean;
}

export type RequestOptions = https.RequestOptions & {formData?: Buffer | string;};
export type RequestCallback = (e: Error, h?: Record<string, any>, d?: Buffer | string) => void;