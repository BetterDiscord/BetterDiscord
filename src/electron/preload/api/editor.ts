import * as IPCEvents from "@common/constants/ipcevents";
import {ipcRenderer} from "electron";

export function open(type: "theme" | "plugin", filename: string): void;
export function open(type: "custom-css"): void;
export function open(type: "custom-css" | "theme" | "plugin", filename?: string): void {
    ipcRenderer.invoke(IPCEvents.EDITOR_OPEN, type, filename);
}

export function updateSettings(settings: import("../../../editor/preload").Settings) {
    ipcRenderer.invoke(IPCEvents.EDITOR_SETTINGS_UPDATE, settings);
}

export function onSettingsChange(listener: (state: Partial<import("../../../editor/preload").Settings>) => void) {
    function callback(_: unknown, state: Partial<import("../../../editor/preload").Settings>) {
        listener(state);
    }

    ipcRenderer.on(IPCEvents.EDITOR_SETTINGS_UPDATE, callback);
    return () => {
        ipcRenderer.off(IPCEvents.EDITOR_SETTINGS_UPDATE, callback);
    };
}