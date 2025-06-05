import * as IPCEvents from "@common/constants/ipcevents";
import {ipcRenderer} from "electron";

export function open(type: "theme" | "plugin", filename: string): void;
export function open(type: "custom-css"): void;
export function open(type: "custom-css" | "theme" | "plugin", filename?: string): void {
    ipcRenderer.invoke(IPCEvents.EDITOR_OPEN, type, filename);
}

export function updateSettings(settings: any) {
    ipcRenderer.invoke(IPCEvents.EDITOR_SETTINGS_UPDATE, settings);
}

export function onLiveUpdateChange(listener: (state: boolean) => void) {
    function callback(_: unknown, state: boolean) {
        listener(state);
    }

    ipcRenderer.on(IPCEvents.EDITOR_SETTINGS_UPDATE, callback);
    return () => {
        ipcRenderer.off(IPCEvents.EDITOR_SETTINGS_UPDATE, callback);
    };
}