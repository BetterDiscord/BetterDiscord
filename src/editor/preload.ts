import electron, {ipcRenderer} from "electron";
import fs from "fs";
import path from "path";
import * as IPCEvents from "@common/constants/ipcevents";

// Windows and macOS both use the fixed global BetterDiscord folder but
// Electron gives the postfixed version of userData, so go up a directory
let userConfig = path.join(electron.ipcRenderer.sendSync(IPCEvents.GET_PATH, "userData"), "..");

// If we're on Linux there are a couple cases to deal with
if (process.platform !== "win32" && process.platform !== "darwin") {
    // Use || instead of ?? because a falsey value of "" is invalid per XDG spec
    userConfig = process.env.XDG_CONFIG_HOME || path.join(process.env.HOME!, ".config");

    // HOST_XDG_CONFIG_HOME is set by flatpak, so use without validation if set
    if (process.env.HOST_XDG_CONFIG_HOME) userConfig = process.env.HOST_XDG_CONFIG_HOME;
}

const dataPath = path.join(userConfig, "BetterDiscord") + "/";

const query = new URLSearchParams(location.search);
const type = query.get("type")!;
const filename = query.get("filename")!;

let filepath;
if (type === "custom-css") {
    filepath = path.join(dataPath, "data", process.env.DISCORD_RELEASE_CHANNEL!, "custom.css");
}
else {
    filepath = path.join(dataPath, `${type}s`, filename);
}

electron.contextBridge.exposeInMainWorld("Editor", {
    type,
    filename,
    filepath,
    read() {
        return fs.readFileSync(filepath, "utf-8");
    },
    open() {
        electron.shell.openPath(filepath);
    },
    write(contents) {
        fs.writeFileSync(filepath, contents, "utf-8");
    },
    shouldShowWarning(showWarning) {
        electron.ipcRenderer.invoke(IPCEvents.EDITOR_SHOULD_SHOW_WARNING, showWarning);
    },
    readText() {
        return electron.clipboard.readText();
    },
    settings: {
        get: () => ipcRenderer.sendSync(IPCEvents.EDITOR_SETTINGS_GET),
        subscribe(listener) {
            electron.ipcRenderer.on(IPCEvents.EDITOR_SETTINGS_UPDATE, (event, settings) => {
                listener(settings);
            });
        },
        setLiveUpdate(state) {
            electron.ipcRenderer.invoke(IPCEvents.EDITOR_SETTINGS_UPDATE, state);
        }
    }
} satisfies typeof window.Editor);