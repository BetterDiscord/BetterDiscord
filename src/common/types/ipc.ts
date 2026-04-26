import type * as https from "node:https";

export interface DialogOptions {
    /** Determines whether the dialog should open or save files */
    mode: "open" | "save";
    /** The path the dialog should show on launch */
    defaultPath: string;
    /** An array of [file filters](https://www.electronjs.org/docs/latest/api/structures/file-filter) */
    filters: Array<Record<string, string[]>>;
    /** A title for the titlebar */
    title: string;
    /** A message for the dialog */
    message: string;
    /** Whether the user should be prompted when overwriting a file */
    showOverwriteConfirmation: boolean;
    /** Whether hidden files should be shown in the dialog */
    showHiddenFiles: boolean;
    /** Whether the user should be prompted to create non-existent folders */
    promptToCreate: boolean;
    /** Whether the user should be able to select a directory as a target */
    openDirectory: boolean;
    /** Whether the user should be able to select a file as a target */
    openFile: boolean;
    /** Whether the user should be able to select multiple targets */
    multiSelections: boolean;
    /** Whether the dialog should act as a modal to the main window */
    modal: boolean;
}

export type RequestOptions = https.RequestOptions & {formData?: Buffer | string;};
export type RequestCallback = (e: Error, h?: Record<string, any>, d?: Buffer | string) => void;