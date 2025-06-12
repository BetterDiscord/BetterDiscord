import electron from "electron";
import path from "path";

import * as IPCEvents from "common/constants/ipcevents";

// Windows and macOS both use the fixed global BetterDiscord folder but
// Electron gives the postfixed version of userData, so go up a directory
let userConfig = path.join(electron.ipcRenderer.sendSync(IPCEvents.GET_PATH, "userData"), "..");

// If we're on Linux there are a couple cases to deal with
if (process.platform !== "win32" && process.platform !== "darwin") {
    // Use || instead of ?? because a falsey value of "" is invalid per XDG spec
    userConfig = process.env.XDG_CONFIG_HOME || path.join(process.env.HOME, ".config");

    // HOST_XDG_CONFIG_HOME is set by flatpak, so use without validation if set
    if (process.env.HOST_XDG_CONFIG_HOME) userConfig = process.env.HOST_XDG_CONFIG_HOME;
}

const dataPath = path.join(userConfig, "BetterDiscord") + "/";

let _settings;
function getSetting(category, key) {
    if (_settings) return _settings[category]?.[key];

    try {
        const settingsFile = path.resolve(dataPath, "data", process.env.DISCORD_RELEASE_CHANNEL, "settings.json");
        _settings = __non_webpack_require__(settingsFile) ?? {};
        return _settings[category]?.[key];
    }
    catch (_) {
        _settings = {};
        return _settings[category]?.[key];
    }
}

const {exposeInMainWorld} = electron.contextBridge;

// Hold the listeners
let /** @type {Function} */ onOpened, /** @type {Function} */ onClosed;

let isOpen = false;
/** @type {boolean} */
let patchDevtoolsCallbacks = getSetting("developer", "devToolsWarning");
if (typeof patchDevtoolsCallbacks !== "boolean") patchDevtoolsCallbacks = false;

const contextBridge = {
    ...electron.contextBridge,
    exposeInMainWorld(apiKey, api) {
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

            api.window.setDevtoolsCallbacks = (_onOpened, _onClosed) => {
                onOpened = _onOpened;
                onClosed = _onClosed;
            };
        }

        exposeInMainWorld(apiKey, api);
    }
};

class DiscordNativePatch {
    static setDevToolsWarningState(value) {
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
                    #app-mount > div[class*=titleBar_] { display: none !important; }
                    .platform-osx nav[class^=wrapper_][class*=guilds_] {margin-top: 0;}
                    .platform-win div[class^=content_] > div[class^=sidebar_] {border-radius: 0;}
                `;

                global.document.body.append(style);
            }
        });

        mutationObserver.observe(global.document, {childList: true, subtree: true});
    }

    static patch() {
        const electronPath = __non_webpack_require__.resolve("electron");
        delete __non_webpack_require__.cache[electronPath].exports; // If it didn't work, try to delete existing
        __non_webpack_require__.cache[electronPath].exports = {...electron, contextBridge}; // Try to assign again after deleting
    }

    static init() {
        this.injectCSS();
        this.patch();
    }
}

export default DiscordNativePatch;