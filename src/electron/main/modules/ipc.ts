import {spawn} from "child_process";
import {ipcMain as ipc, BrowserWindow, app, dialog, systemPreferences, shell, type IpcMainInvokeEvent, type IpcMainEvent, type BrowserWindowConstructorOptions} from "electron";

import * as IPCEvents from "@common/constants/ipcevents";
import Editor from "./editor";

const getPath = (event: IpcMainEvent, pathReq: string) => {
    let returnPath;
    switch (pathReq) {
        case "appPath":
            returnPath = app.getAppPath();
            break;
        case "appData":
        case "userData":
        case "home":
        case "cache":
        case "temp":
        case "exe":
        case "module":
        case "desktop":
        case "documents":
        case "downloads":
        case "music":
        case "pictures":
        case "videos":
        case "recent":
        case "logs":
            returnPath = app.getPath(pathReq as Parameters<typeof app.getPath>[0]);
            break;
        default:
            returnPath = "";
    }

    event.returnValue = returnPath;
};

const openPath = (_: IpcMainEvent, path: string) => {
    if (process.platform === "win32") spawn("explorer.exe", [path]);
    else shell.openPath(path);
};

const relaunch = (_: IpcMainEvent, args: string[] = []) => {
    app.relaunch({args: process.argv.slice(1).concat(Array.isArray(args) ? args : [args])});
    app.quit();
};

const runScript = async (event: IpcMainInvokeEvent, script: string) => {
    try {
        // TODO: compile with vm to prevent escape with clever strings
        await event.sender.executeJavaScript(`(() => {try {${script}} catch {}})();`);
    }
    catch {
        // TODO: cut a log
    }
};

const openDevTools = (event: IpcMainEvent) => event.sender.openDevTools();
const closeDevTools = (event: IpcMainEvent) => event.sender.closeDevTools();
const toggleDevTools = (event: IpcMainEvent) => {
    if (!event.sender.isDevToolsOpened()) openDevTools(event);
    else closeDevTools(event);
};

const createBrowserWindow = (_: IpcMainInvokeEvent, url: string, {windowOptions, closeOnUrl}: {windowOptions?: BrowserWindowConstructorOptions, closeOnUrl?: string;} = {}) => {
    return new Promise<void>(resolve => {
        const windowInstance = new BrowserWindow(windowOptions);
        windowInstance.webContents.on("did-navigate", (__, navUrl) => {
            if (navUrl != closeOnUrl) return;
            windowInstance.close();
            resolve();
        });
        windowInstance.loadURL(url);
    });
};

const inspectElement = async (event: IpcMainEvent) => {
    if (!event.sender.isDevToolsOpened()) {
        event.sender.openDevTools();
        while (!event.sender.isDevToolsOpened()) await new Promise(r => setTimeout(r, 100));
    }
    event.sender.devToolsWebContents?.executeJavaScript("DevToolsAPI.enterInspectElementMode();");
};

const setMinimumSize = (event: IpcMainEvent, width: number, height: number) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.setMinimumSize(width, height);
};

const setWindowSize = (event: IpcMainEvent, width: number, height: number) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.setSize(width, height);
};

const getAccentColor = () => {
    // intentionally left blank so that fallback colors will be used
    return ((process.platform == "win32" || process.platform == "darwin")
        && systemPreferences.getAccentColor()) || "";
};

const stopDevtoolsWarning = (event: IpcMainEvent) => event.sender.removeAllListeners("devtools-opened");


// TODO: make type usable across processes
interface DialogOptions {
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

const openDialog = (event: IpcMainInvokeEvent, options: Partial<DialogOptions> = {}) => {
    const {
        mode = "open",
        openDirectory = false,
        openFile = true,
        multiSelections = false,
        filters,
        promptToCreate = false,
        defaultPath,
        title,
        showOverwriteConfirmation,
        message,
        showHiddenFiles,
        modal = false
    } = options;
    const openFunction = {
        open: dialog.showOpenDialog,
        save: dialog.showSaveDialog
    }[mode];
    if (!openFunction) return Promise.resolve({error: "Unkown Mode: " + mode});

    // @ts-expect-error cba to write separate types for these dialogs that are never used
    return openFunction(...[
        modal && BrowserWindow.fromWebContents(event.sender),
        {
            defaultPath,
            filters,
            title,
            message,
            createDirectory: true,
            properties: [
                showHiddenFiles && "showHiddenFiles",
                openDirectory && "openDirectory",
                promptToCreate && "promptToCreate",
                openDirectory && "openDirectory",
                openFile && "openFile",
                multiSelections && "multiSelections",
                showOverwriteConfirmation && "showOverwriteConfirmation"
            ].filter(e => e),
        }
    ].filter(e => e));
};
const registerPreload = (_: IpcMainEvent, path: string) => {
    app.commandLine.appendSwitch("preload", path);
};
const openEditor = (_: IpcMainInvokeEvent, type: "plugin" | "theme", filename: string) => {
    Editor.open(type, filename);
};

const updateSettings = (_: IpcMainInvokeEvent, settings: any) => {
    Editor.updateSettings(settings);
};
const getSettings = (event: IpcMainEvent) => {
    event.returnValue = Editor.getSettings();
};

export default class IPCMain {
    static registerEvents() {
        try {
            ipc.on(IPCEvents.GET_PATH, getPath);
            ipc.on(IPCEvents.OPEN_PATH, openPath);
            ipc.on(IPCEvents.RELAUNCH, relaunch);
            ipc.on(IPCEvents.OPEN_DEVTOOLS, openDevTools);
            ipc.on(IPCEvents.CLOSE_DEVTOOLS, closeDevTools);
            ipc.on(IPCEvents.TOGGLE_DEVTOOLS, toggleDevTools);
            ipc.on(IPCEvents.INSPECT_ELEMENT, inspectElement);
            ipc.on(IPCEvents.MINIMUM_SIZE, setMinimumSize);
            ipc.on(IPCEvents.WINDOW_SIZE, setWindowSize);
            ipc.on(IPCEvents.DEVTOOLS_WARNING, stopDevtoolsWarning);
            ipc.on(IPCEvents.REGISTER_PRELOAD, registerPreload);
            ipc.on(IPCEvents.EDITOR_SETTINGS_GET, getSettings);
            ipc.handle(IPCEvents.GET_ACCENT_COLOR, getAccentColor);
            ipc.handle(IPCEvents.RUN_SCRIPT, runScript);
            ipc.handle(IPCEvents.OPEN_DIALOG, openDialog);
            ipc.handle(IPCEvents.OPEN_WINDOW, createBrowserWindow);
            ipc.handle(IPCEvents.EDITOR_OPEN, openEditor);
            ipc.handle(IPCEvents.EDITOR_SETTINGS_UPDATE, updateSettings);
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
    }
}