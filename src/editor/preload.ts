import electron, {ipcRenderer} from "electron";
import fs from "fs";
import path from "path";
import * as IPCEvents from "@common/constants/ipcevents";

// Build info file only exists for non-linux (for current injection)
let dataPath = "";
if (process.platform === "win32" || process.platform === "darwin") dataPath = path.join(electron.ipcRenderer.sendSync(IPCEvents.GET_PATH, "userData"), "..");
else dataPath = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME!, ".config"); // This will help with snap packages eventually
dataPath = path.join(dataPath, "BetterDiscord") + "/";

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