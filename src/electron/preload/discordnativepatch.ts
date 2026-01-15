import electron from "electron";
import path from "path";

import * as IPCEvents from "@common/constants/ipcevents";

let dataPath = "";
if (process.platform === "win32" || process.platform === "darwin") dataPath = path.join(electron.ipcRenderer.sendSync(IPCEvents.GET_PATH, "userData"), "..");
else dataPath = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(process.env.HOME!, ".config"); // This will help with snap packages eventually
dataPath = path.join(dataPath, "BetterDiscord") + "/";

let _settings: Record<string, Record<string, any>>;
function getSetting(category: string, key: string) {
    if (_settings) return _settings[category]?.[key];

    try {
        const settingsFile = path.resolve(dataPath, "data", process.env.DISCORD_RELEASE_CHANNEL!, "settings.json");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        _settings = require(settingsFile) ?? {};
        return _settings[category]?.[key];
    }
    catch {
        _settings = {};
        return _settings[category]?.[key];
    }
}

const {exposeInMainWorld} = electron.contextBridge;

// Hold the listeners
let /** @type {Function} */ onOpened: () => void, /** @type {Function} */ onClosed: () => void;

let isOpen = false;
/** @type {boolean} */
let patchDevtoolsCallbacks: boolean = getSetting("developer", "devToolsWarning");
if (typeof patchDevtoolsCallbacks !== "boolean") patchDevtoolsCallbacks = false;

const contextBridge = {
    ...electron.contextBridge,
    exposeInMainWorld(apiKey: string, api: any) {
        if (apiKey === "DiscordNative") {
            // On macOS check if native frame is enabled
            // every other os say false
            api.window.USE_OSX_NATIVE_TRAFFIC_LIGHTS = process.platform === "darwin" && process.env.BETTERDISCORD_IN_APP_TRAFFIC_LIGHTS === "false";

            api.window.setDevtoolsCallbacks(
                () => {
                    isOpen = true;
                    if (!patchDevtoolsCallbacks) onOpened?.();
                },
                () => {
                    isOpen = false;
                    if (!patchDevtoolsCallbacks) onClosed?.();
                }
            );

            api.window.setDevtoolsCallbacks = (_onOpened: () => void, _onClosed: () => void) => {
                onOpened = _onOpened;
                onClosed = _onClosed;
            };
        }

        exposeInMainWorld(apiKey, api);
    }
};

class DiscordNativePatch {
    static setDevToolsWarningState(value: boolean) {
        patchDevtoolsCallbacks = value;

        // If devtools is open
        if (isOpen) {
            // If you enable it, run the onClsoed function
            if (value) onClosed?.();
            // If its disabled, run the onOpened function
            else onOpened?.();
        }
    }

    // For native frame
    // document.body does not exist when this is ran.
    // so we have to wait for it
    static injectCSS() {
        if (process.env.BETTERDISCORD_NATIVE_FRAME === "false") return;

        // Have to use `global.` because the file is in node
        const mutationObserver = new global.MutationObserver(() => {
            if (global.document.body) {
                mutationObserver.disconnect();

                const style = global.document.createElement("style");
                style.textContent = `
                    #app-mount > div[class*=titleBar_], div[class*="-winButtons"] { display: none !important; }
                    .platform-osx nav[class*=wrapper_][class*=guilds_] {margin-top: 0;}
                    .platform-win div[class*=content_] > div[class*=sidebar_] {border-radius: 0;}
                `;

                global.document.body.append(style);
            }
        });

        mutationObserver.observe(global.document, {childList: true, subtree: true});
    }

    static patch() {
        const electronPath = require.resolve("electron");
        delete require.cache[electronPath]!.exports; // If it didn't work, try to delete existing
        require.cache[electronPath]!.exports = {...electron, contextBridge}; // Try to assign again after deleting
    }

    static init() {
        this.injectCSS();
        this.patch();
    }
}

export default DiscordNativePatch;