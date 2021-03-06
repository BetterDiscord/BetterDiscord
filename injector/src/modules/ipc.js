import {ipcMain as ipc, BrowserWindow, app, dialog} from "electron";

import * as IPCEvents from "common/constants/ipcevents";

const getPath = (event, pathReq) => {
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
            returnPath = app.getPath(pathReq);
            break;
        default:
            returnPath = "";
    }

    event.returnValue = returnPath;
};

const relaunch = () => {
    app.quit();
    app.relaunch();
};

const runScript = async (event, script) => {
    try {
        // TODO: compile with vm to prevent escape with clever strings
        await event.sender.executeJavaScript(`(() => {try {${script}} catch {}})();`);
    }
    catch (e) {
        // TODO: cut a log
    }
};

const openDevTools = event => event.sender.openDevTools();
const closeDevTools = event => event.sender.closeDevTools();

const createBrowserWindow = async (event, url, {windowOptions, closeOnUrl} = {}) => {
    return await new Promise(resolve => {
        const windowInstance = new BrowserWindow(windowOptions);
        windowInstance.webContents.on("did-navigate", (_, navUrl) => {
            if (navUrl != closeOnUrl) return;
            windowInstance.close();
            resolve();
        });
        windowInstance.loadURL(url);
    });
};

export default class IPCMain {
    static registerEvents() {
        ipc.on(IPCEvents.GET_PATH, getPath);
        ipc.on(IPCEvents.RELAUNCH, relaunch);
        ipc.on(IPCEvents.OPEN_DEVTOOLS, openDevTools);
        ipc.on(IPCEvents.CLOSE_DEVTOOLS, closeDevTools);
        ipc.handle(IPCEvents.RUN_SCRIPT, runScript);
        ipc.handle(IPCEvents.OPEN_WINDOW, createBrowserWindow);
    }
}