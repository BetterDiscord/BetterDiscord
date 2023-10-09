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

    relaunch() {
        return ipc.send(IPCEvents.RELAUNCH);
    }

    runScript(script) {
        return ipc.invoke(IPCEvents.RUN_SCRIPT, script);
    }

    openWindow(url, options) {
        return ipc.invoke(IPCEvents.OPEN_WINDOW, url, options);
    }

    inspectElement() {
        return ipc.send(IPCEvents.INSPECT_ELEMENT);
    }

    setMinimumSize(width, height) {
        return ipc.send(IPCEvents.MINIMUM_SIZE, width, height);
    }

    setWindowSize(width, height) {
        return ipc.send(IPCEvents.WINDOW_SIZE, width, height);
    }

    stopDevtoolsWarning() {
        return ipc.send(IPCEvents.DEVTOOLS_WARNING);
    }

    openDialog(options) {
        return ipc.invoke(IPCEvents.OPEN_DIALOG, options);
    }

    getSystemAccentColor() {
        return ipc.invoke(IPCEvents.GET_ACCENT_COLOR);
    }
};