import {getByKeys, getModule} from "@webpack";

type GlobalKeybindKey = [0, number];
type GlobalKeybindKeyArray = GlobalKeybindKey[];
type GlobalKeybindOptions = {
    blurred: boolean;
    focused: boolean;
    keydown: boolean;
    keyup: boolean;
};

type WindowKeybindKey = {ctrl: boolean; alt: boolean; shift: boolean; meta: boolean; keys: string[];};
type WindowKeybindKeyArray = WindowKeybindKey[];
type WindowKeybindOptions = {
    keydown: boolean;
    keyup: boolean;
};

type Keys = number[] | string[];
type Keybind = {event: string, keys: Keys, callback: (() => void) | ((e: KeyboardEvent) => void);};

const platform = process.platform;
const ctrl = platform === "win32" ? 0xa2 : platform === "darwin" ? 0xe0 : 0x25;
const keybindModule = getModule(m => m.ctrl === ctrl, {searchExports: true}) as {[key: string]: number;};
const reversedKeybindModule = (() => {
    if (!keybindModule) return {};
    return Object.entries(keybindModule).reduce((acc: Record<number, string>, [key, value]) => {
        acc[value as number] = key;
        return acc;
    }, {});
})();

/**
 * Remaps the keyCode string to the correct value based also on the location.
 * @param keyCode
 * @param location
 * @returns {number}
 */
export function remapKeyCode(keyCode: number, location: number) {
    if (keyCode === 18 || keyCode === 17 || keyCode === 16) {
        let key = "";
        if (location === 2) {
            key = "right ";
        }
        if (keyCode === 18) key += "alt";
        if (keyCode === 17) key += "ctrl";
        if (keyCode === 16) key += "shift";
        keyCode = keybindModule[key];
    }

    return keyCode;
};

/**
 * Remaps an array of key codes to their string representation.
 * Uses Discord's internal key code mapping.
 * @param {number[]} arr The array of key codes to remap.
 * @returns {string[]} An array of strings representing the key codes.
 */
export function reverseRemapArray(arr: number[]) {
    return arr.map((key) => {
        let keyName = reversedKeybindModule[key];
        if (keyName.startsWith("alt") || keyName.startsWith("ctrl") || keyName.startsWith("meta") || keyName.startsWith("shift")) {
            keyName = "left " + keyName;
        }
        return keyName;
    });
}

const getDiscordUtils = getByKeys(["getDiscordUtils"]) as {
    getDiscordUtils(): object;
};
const DiscordUtils = getDiscordUtils.getDiscordUtils() as {
    inputEventRegister(id: number, keys: GlobalKeybindKey[], callback: () => void, options: GlobalKeybindOptions): undefined;
    inputEventUnregister(id: number): undefined;
};

window.addEventListener("keydown", (e: KeyboardEvent) => {
    KeybindsManager.keysDown.add(e.key);
    KeybindsManager.keysUp.delete(e.key);
});
window.addEventListener("keyup", (e: KeyboardEvent) => {
    KeybindsManager.keysUp.add(e.key);
    KeybindsManager.keysDown.delete(e.key);
});

/**
 * `KeybindsManager` is a class that manages the registration and unregistration of Keybinds.
 * It handles both global and window Keybinds.
 * @type KeybindsManager
 * @summary {@link KeybindsManager} is a class that manages the registration and unregistration of Keybinds.
 * @name KeybindsManager
 */
class KeybindsManager {
    static gloabalKeybindId: number = 1000;
    static windowsKeybindId: number = 1000;
    static globalKeybinds: Map<string, Map<number, Keybind>> = new Map();
    static windowKeybinds: Map<string, Map<number, Keybind>> = new Map();
    static keysDown: Set<string> = new Set();
    static keysUp: Set<string> = new Set();

    static setupPluginKeybinds(pluginName: string) {
        if (this.globalKeybinds.has(pluginName)) {
            this.unregisterAllKeybinds(pluginName);
        }
        if (this.windowKeybinds.has(pluginName)) {
            this.unregisterAllKeybinds(pluginName);
        }

        const mapGlobal = new Map();
        const mapWindow = new Map();
        this.globalKeybinds.set(pluginName, mapGlobal);
        this.windowKeybinds.set(pluginName, mapWindow);
    };

    static mapKeysToGlobalKeybinds(keys: Keys): GlobalKeybindKeyArray[] {
        if (!keys || keys.length === 0) return [];
        if (typeof keys[0] === "number") {
            const bindKeys: GlobalKeybindKeyArray = [];
            (keys as number[]).forEach((key) => {
                bindKeys.push([0, key]);
            });
            return [bindKeys];
        }
        else if (typeof keys[0] === "string") {
            // Create all possible key combinations based on special keys like shift and ctrl
            const mappedKeybinds: GlobalKeybindKeyArray[] = [];
            const specialKeys: string[] = [];
            const normalKeys: string[] = [];

            // First identify special keys and regular keys
            (keys as string[]).forEach((key) => {
                key = key.toLowerCase();
                if (key === "control") key = "ctrl";
                if (key.startsWith("arrow")) key = key.replace("arrow", "");
                if (key.startsWith("page")) key = key.replace("page", "page ");

                if (key === "ctrl" || key === "shift" || key === "alt" || key === "meta") {
                    specialKeys.push(key);
                }
                else {
                    normalKeys.push(key);
                }
            });

            // Create all permutations
            const numberOfCombinations = Math.pow(2, specialKeys.length);
            for (let i = 0; i < numberOfCombinations; i++) {
                const combination: GlobalKeybindKey[] = [];
                for (let j = 0; j < specialKeys.length; j++) {
                    if ((i & Math.pow(2, j)) > 0) {
                        combination.push([0, keybindModule[specialKeys[j]]]);
                    }
                    else {
                        combination.push([0, keybindModule["right " + specialKeys[j]]]);
                    }
                }
                mappedKeybinds.push(combination);
            }

            // Append to all combinations all normal keys
            for (const mappedKeybind of mappedKeybinds) {
                for (const key of normalKeys) {
                    mappedKeybind.push([0, keybindModule[key]]);
                }
            }

            return mappedKeybinds;
        }
        return [];
    }

    static mapKeysToWindowKeybinds(keys: Keys): WindowKeybindKeyArray {
        if (!keys || keys.length === 0) return [];
        if (typeof keys[0] === "string") {
            const ret: WindowKeybindKey = {ctrl: false, alt: false, shift: false, meta: false, keys: []};
            (keys as string[]).forEach((key) => {
                if (key.startsWith("Control")) {
                    ret.ctrl = true;
                }
                else if (key.startsWith("Alt")) {
                    ret.alt = true;
                }
                else if (key.startsWith("Shift")) {
                    ret.shift = true;
                }
                else if (key.startsWith("Meta")) {
                    ret.meta = true;
                }
                else {
                    ret.keys.push(key);
                }
            });
            return [ret];
        }
        else if (typeof keys[0] === "number") {
            // TODO: Implement mapping from keycode
        }
        return [];
    }

    /**
     * Registers a global Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {string} event Name of the event to register
     * @param {Keys} keys The keybinds to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {Object} options Options for the keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    static registerGlobalKeybind(pluginName: string, event: string, keys: Keys, callback: () => void, options: GlobalKeybindOptions) {
        const toBind = this.mapKeysToGlobalKeybinds(keys);
        if (!this.globalKeybinds.has(pluginName)) return false;
        toBind.forEach((keystoBind) => {
            const id = this.gloabalKeybindId++;
            this.globalKeybinds.get(pluginName)?.set(id, {event, keys, callback});
            DiscordUtils.inputEventRegister(id, keystoBind, callback, options);
        });
        return true;
    }

    /**
     * Unregisters a global Keybind.
     * @param {string} pluginName Name of the plugin to unregister the Keybind for
     * @param {string} event Name of the event to unregister
     * @returns {boolean} Whether the Keybind was unregistered
     */
    static unregisterGlobalKeybind(pluginName: string, event: string) {
        const keybinds = this.globalKeybinds.get(pluginName);
        if (!keybinds) return false;
        for (const [id, keybind] of keybinds.entries()) {
            if (keybind.event === event) {
                DiscordUtils.inputEventUnregister(id);
                keybinds.delete(id);
            }
        }
        return true;
    }

    /**
     * Registers a window Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {string} event Name of the event to register
     * @param {Keys} keys The keybinds to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {Object} options Options for the keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    static registerWindowKeybind(pluginName: string, event: string, keys: Keys, callback: () => void, options: WindowKeybindOptions) {
        const toBind = this.mapKeysToWindowKeybinds(keys);
        toBind.forEach((keystoBind) => {
            const id = this.windowsKeybindId++;
            const handleCallback = (e: KeyboardEvent) => {
                if (e.altKey === keystoBind.alt && e.ctrlKey === keystoBind.ctrl && e.shiftKey === keystoBind.shift && e.metaKey === keystoBind.meta) {
                    let checkKeys = true;
                    keystoBind.keys.forEach((key) => {
                        if (!this.keysDown.has(key)) {
                            checkKeys = false;
                        }
                    });
                    if (!checkKeys) return;
                    callback();
                }
            };
            this.windowKeybinds.get(pluginName)?.set(id, {event: event, keys: keys, callback: handleCallback});

            if (options.keydown) {
                window.addEventListener("keydown", handleCallback);
            }
            if (options.keyup) {
                window.addEventListener("keyup", handleCallback);
            }
        });
        return true;
    }

    /**
     * Unregisters a window Keybind.
     * @param {string} pluginName Name of the plugin to unregister the Keybind for
     * @param {string} event Name of the event to unregister
     * @returns {boolean} Whether the Keybind was unregistered
     */
    static unregisterWindowKeybind(pluginName: string, event: string) {
        const keybinds = this.windowKeybinds.get(pluginName);
        if (!keybinds) return false;
        keybinds?.forEach((keybind, id) => {
            if (keybind.event === event) {
                window.removeEventListener("keydown", keybind.callback);
                window.removeEventListener("keyup", keybind.callback);
                keybinds.delete(id);
            }
        });
        return true;
    }

    /**
     * Unregisters all Keybinds for the plugin.
     * @param {string} pluginName Name of the plugin to unregister the Keybinds for
     * @returns {boolean} Whether the Keybinds were unregistered
     */
    static unregisterAllKeybinds(pluginName: string) {
        const globalKeybinds = this.globalKeybinds.get(pluginName);
        globalKeybinds?.forEach((keybind, id) => {
            DiscordUtils.inputEventUnregister(id);
            globalKeybinds.delete(id);
        });
        const windowKeybinds = this.windowKeybinds.get(pluginName);
        windowKeybinds?.forEach((keybind, id) => {
            window.removeEventListener("keydown", keybind.callback);
            window.removeEventListener("keyup", keybind.callback);
            windowKeybinds.delete(id);
        });
        return true;
    }
}

/**
 * `Keybinds` is a simple utility class for the management of plugin global Keybinds. An instance is available on {@link BdApi}.
 * @type Keybinds
 * @summary {@link Keybinds} is a simple utility class for the management of plugin Keybinds.
 * @name Keybinds
 */
export class Keybinds {
    #callerName = "";

    constructor(callerName?: string) {
        this.#callerName = callerName || "BD";
        KeybindsManager.setupPluginKeybinds(this.#callerName);
    }

    /**
     * Registers a Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {string} event Name of the event to register
     * @param {Keys} keys The keys to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {boolean} global Whether the Keybind is global or window
     * @param {Object} options Options for the Keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    registerKeybind(pluginName: string, event: string, keys: Keys, callback: () => void, global: boolean, options?: GlobalKeybindOptions | WindowKeybindOptions) {
        if (this.#callerName) {
            options = global as unknown as WindowKeybindOptions | GlobalKeybindOptions;
            global = callback as unknown as boolean;
            callback = keys as unknown as () => void;
            keys = event as unknown as Keys;
            event = pluginName as unknown as string;
            pluginName = this.#callerName;
        }
        if (options === undefined) {
            if (global) {
                options = {blurred: true, focused: true, keydown: true, keyup: false};
            }
            else {
                options = {keydown: true, keyup: false};
            }
        }
        return global ? KeybindsManager.registerGlobalKeybind(pluginName, event, keys, callback, options as GlobalKeybindOptions) : KeybindsManager.registerWindowKeybind(pluginName, event, keys, callback, options as WindowKeybindOptions);
    };

    /**
     * Unregisters a Keybind.
     * @param {string} event Name of the event to unregister
     * @returns {boolean} Whether the Keybind was unregistered
     */
    unregisterKeybind(pluginName: string, event: string, global: boolean) {
        if (this.#callerName) {
            event = pluginName;
            pluginName = this.#callerName;
        }
        return global ? KeybindsManager.unregisterGlobalKeybind(pluginName, event) : KeybindsManager.unregisterWindowKeybind(pluginName, event);
    }

    /**
     * Unregisters all Keybinds for the plugin.
     * @returns {boolean} Whether the Keybinds were unregistered
     */
    unregisterAllKeybinds(pluginName: string) {
        if (this.#callerName) {
            pluginName = this.#callerName;
        }
        return KeybindsManager.unregisterAllKeybinds(pluginName);
    }
}

Object.freeze(Keybinds);
Object.freeze(Keybinds.prototype);
Object.freeze(Keybinds.constructor);
export default Keybinds;