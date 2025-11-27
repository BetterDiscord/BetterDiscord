import {ipcRenderer as ipc} from "electron";

import * as IPCEvents from "@common/constants/ipcevents";

import Events from "./emitter";


export default new class IPCRenderer {

    constructor() {
        ipc.on(IPCEvents.NAVIGATE, () => Events.dispatch("navigate"));
        ipc.on(IPCEvents.MAXIMIZE, () => Events.dispatch("maximize"));
        ipc.on(IPCEvents.MINIMIZE, () => Events.dispatch("minimize"));
    }

    openDevTools() {
        return ipc.send(IPCEvents.OPEN_DEVTOOLS);
    }

    closeDevTools() {
        return ipc.send(IPCEvents.CLOSE_DEVTOOLS);
    }

    toggleDevTools() {
        return ipc.send(IPCEvents.TOGGLE_DEVTOOLS);
    }

    relaunch(args?: string[]) {
        return ipc.send(IPCEvents.RELAUNCH, args);
    }

    runScript(script: string) {
        return ipc.invoke(IPCEvents.RUN_SCRIPT, script);
    }

    openWindow(url: string, options: {windowOptions: object; closeOnUrl: boolean;}) {
        return ipc.invoke(IPCEvents.OPEN_WINDOW, url, options);
    }

    inspectElement() {
        return ipc.send(IPCEvents.INSPECT_ELEMENT);
    }

    setMinimumSize(width: number, height: number) {
        return ipc.send(IPCEvents.MINIMUM_SIZE, width, height);
    }

    setWindowSize(width: number, height: number) {
        return ipc.send(IPCEvents.WINDOW_SIZE, width, height);
    }

    stopDevtoolsWarning() {
        return ipc.send(IPCEvents.DEVTOOLS_WARNING);
    }

    // TODO: merge dialog options type with main process
    openDialog(options: object) {
        return ipc.invoke(IPCEvents.OPEN_DIALOG, options);
    }

    getSystemAccentColor(): Promise<string> {
        return ipc.invoke(IPCEvents.GET_ACCENT_COLOR);
    }

    openPath(path: string) {
        return ipc.send(IPCEvents.OPEN_PATH, path);
    }
};