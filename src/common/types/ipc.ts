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