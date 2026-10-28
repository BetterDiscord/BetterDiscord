import electron, {ipcRenderer} from "electron";
import fs from "fs";
import path from "path";
import * as IPCEvents from "@common/constants/ipcevents";
import type {AddonType} from "@typed/addon";

// Build info file only exists for non-linux (for current injection)
let dataPath = "";
if (process.platform === "win32" || process.platform === "darwin") dataPath = path.join(electron.ipcRenderer.sendSync(IPCEvents.GET_PATH, "userData"), "..");
else dataPath = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME!, ".config"); // This will help with snap packages eventually
dataPath = path.join(dataPath, "BetterDiscord") + "/";

const query = new URLSearchParams(location.search);

const type = query.get("type")! as "custom-css" | AddonType;
const filename = query.get("filename")!;

let filepath;
if (type === "custom-css") {
    filepath = path.join(dataPath, "data", process.env.DISCORD_RELEASE_CHANNEL!, "custom.css");
}
else {
    filepath = path.join(dataPath, `${type}s`, filename);
}

export interface Settings {
    liveUpdate: boolean;
    options: import("monaco-editor").editor.IStandaloneEditorConstructionOptions;
    discordTheme: "light" | "dark" | "darker" | "midnight";
    alwaysOnTop: boolean;
}

const editor = {
    type,
    filename,
    filepath,
    read() {
        return fs.readFileSync(filepath, "utf-8");
    },
    open() {
        electron.shell.openPath(filepath).then(() => window.close());
    },
    write(contents: string) {
        fs.writeFileSync(filepath, contents, "utf-8");
    },
    shouldShowWarning(showWarning: boolean) {
        electron.ipcRenderer.invoke(IPCEvents.EDITOR_SHOULD_SHOW_WARNING, showWarning);
    },
    readText() {
        return electron.clipboard.readText();
    },
    settings: {
        get: () => ipcRenderer.sendSync(IPCEvents.EDITOR_SETTINGS_GET) as Settings,
        subscribe(listener: (settings: Settings) => void) {
            electron.ipcRenderer.on(IPCEvents.EDITOR_SETTINGS_UPDATE, (_, settings) => {
                listener(settings);
            });
        },
        set(settings: Partial<Settings>) {
            electron.ipcRenderer.invoke(IPCEvents.EDITOR_SETTINGS_UPDATE, settings);
        }
    }
};

electron.contextBridge.exposeInMainWorld("Editor", editor);

export type EditorNative = typeof editor;