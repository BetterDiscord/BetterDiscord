import Logger from "@common/logger";
import {getByKeys, getModule} from "@webpack";

type GlobalKeybindKey = [0, number];
type GlobalKeybindKeyArray = GlobalKeybindKey[];
type GlobalKeybindOptions = {
    blurred: boolean;
    focused: boolean;
    keydown: boolean;
    keyup: boolean;
};

type WindowKey = {
    key: string;
    location: number | undefined;// undefined for any location
};

type WindowKeybindKey = WindowKey[];
type WindowKeybindKeyArray = WindowKeybindKey[];
type WindowKeybindOptions = {
    keydown: boolean;
    keyup: boolean;
};

type Keys = number[] | string[];
type Keybind = {event: string, keys: Keys, callback: (() => void) | ((e: KeyboardEvent) => void);};

const getDiscordUtils = getByKeys(["getDiscordUtils"]) as {
    getDiscordUtils(): object;
};
const DiscordUtils = getDiscordUtils.getDiscordUtils() as {
    inputEventRegister(id: number, keys: GlobalKeybindKey[], callback: () => void, options: GlobalKeybindOptions): undefined;
    inputEventUnregister(id: number): undefined;
};

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

// Listeners used to track the keys pressed for the window keybinds
window.addEventListener("keydown", (e: KeyboardEvent) => {
    KeybindsManager.keysDown.set(e.key, e.location);
    KeybindsManager.keysUp.delete(e.key);
});
window.addEventListener("keyup", (e: KeyboardEvent) => {
    KeybindsManager.keysUp.set(e.key, e.location);
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
    static keysDown: Map<string, number> = new Map();
    static keysUp: Map<string, number> = new Map();

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
            for (const key of keys as number[]) {
                bindKeys.push([0, key]);
            };
            return [bindKeys];
        }
        else if (typeof keys[0] === "string") {
            // Create all possible key combinations based on special keys like shift and ctrl
            const mappedKeybinds: GlobalKeybindKeyArray[] = [];
            const specialKeys: string[] = [];
            const normalKeys: string[] = [];

            // First identify special keys and regular keys
            for (const key of keys as string[]) {
                let keyL = key.toLowerCase();
                if (keyL === "control") keyL = "ctrl";
                if (keyL.startsWith("arrow")) keyL = keyL.replace("arrow", "");
                if (keyL.startsWith("page")) keyL = keyL.replace("page", "page ");

                if (keyL === "ctrl" || keyL === "shift" || keyL === "alt" || keyL === "meta") {
                    specialKeys.push(keyL);
                }
                else {
                    normalKeys.push(keyL);
                }
            };

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
        const ret: WindowKeybindKey = [];
        if (typeof keys[0] === "string") {
            for (const key of keys as string[]) {
                let location: number | undefined = 0;
                if (key.startsWith("Control") || key.startsWith("Alt") || key.startsWith("Shift") || key.startsWith("Meta")) {
                    location = undefined;
                }
                ret.push({key: key, location: location});
            };
            return [ret];
        }
        else if (typeof keys[0] === "number") {
            const reversedMappedKeys = reverseRemapArray(keys as number[]);
            for (const key of reversedMappedKeys) {
                let location = 0;
                let keyN = "";
                if (key.endsWith("ctrl")) {
                    location = key.startsWith("right") ? 2 : 1;
                    keyN = "Control";
                }
                else if (key.endsWith("alt")) {
                    location = key.startsWith("right") ? 2 : 1;
                    keyN = "Alt";
                }
                else if (key.endsWith("shift")) {
                    location = key.startsWith("right") ? 2 : 1;
                    keyN = "Shift";
                }
                else if (key.endsWith("meta")) {
                    location = key.startsWith("right") ? 2 : 1;
                    keyN = "Meta";
                }
                else {
                    keyN = key;
                }
                ret.push({key: keyN, location: location});
            };
            return [ret];
        }
        return [];
    }

    /**
     * Registers a global Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {string} event Name of the event to register
     * @param {Keys} keys The keybinds to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {GlobalKeybindOptions} options Options for the keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    static registerGlobalKeybind(pluginName: string, event: string, keys: Keys, callback: () => void, options: GlobalKeybindOptions = {blurred: true, focused: true, keydown: true, keyup: false}) {
        const toBind = this.mapKeysToGlobalKeybinds(keys);
        const keybinds = this.globalKeybinds.get(pluginName);
        if (!keybinds) throw new Error("KeybindsManager: No keybinds Map found for the plugin " + pluginName);// Otherwise we would have to create a new Map here

        for (const keysToBind of toBind) {
            const id = this.gloabalKeybindId++;
            keybinds.set(id, {event, keys, callback});
            DiscordUtils.inputEventRegister(id, keysToBind, callback, options);
        };

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
        if (!keybinds) throw new Error("KeybindsManager: No keybinds Map found for the plugin " + pluginName);

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
     * @param {WindowKeybindOptions} options Options for the keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    static registerWindowKeybind(pluginName: string, event: string, keys: Keys, callback: () => void, options: WindowKeybindOptions = {keydown: true, keyup: false}) {
        const toBind = this.mapKeysToWindowKeybinds(keys);
        const keybinds = this.windowKeybinds.get(pluginName);
        if (!keybinds) throw new Error("KeybindsManager: No keybinds Map found for the plugin " + pluginName);// Otherwise we would have to create a new Map here

        for (const keysToBind of toBind) {
            const id = this.windowsKeybindId++;

            const handleCallback = (e: KeyboardEvent) => {
                if (keysToBind.find(key => key.key === e.key)) {
                    let checkKeys = true;
                    for (const key of keysToBind) {
                        const location = this.keysDown.get(key.key) || e.location;
                        if (location === undefined) {
                            checkKeys = false;
                        }
                        else if (location !== key.location && key.location !== undefined) {
                            checkKeys = false;
                        }
                    };
                    if (!checkKeys) return;
                    callback();
                }
            };
            keybinds.set(id, {event: event, keys: keys, callback: handleCallback});

            if (options.keydown) {
                window.addEventListener("keydown", handleCallback);
            }
            if (options.keyup) {
                window.addEventListener("keyup", handleCallback);
            }
        };
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
        if (!keybinds) throw new Error("KeybindsManager: No keybinds Map found for the plugin " + pluginName);

        for (const [id, keybind] of keybinds.entries()) {
            if (keybind.event === event) {
                window.removeEventListener("keydown", keybind.callback);
                window.removeEventListener("keyup", keybind.callback);
                keybinds.delete(id);
            }
        };
        return true;
    }

    /**
     * Unregisters all Keybinds for the plugin.
     * @param {string} pluginName Name of the plugin to unregister the Keybinds for
     * @returns {boolean} Whether the Keybinds were unregistered
     */
    static unregisterAllKeybinds(pluginName: string) {
        const globalKeybinds = this.globalKeybinds.get(pluginName);
        if (globalKeybinds) {
            for (const id of globalKeybinds.keys()) {
                DiscordUtils.inputEventUnregister(id);
            }
            globalKeybinds.clear();
        }
        const windowKeybinds = this.windowKeybinds.get(pluginName);
        if (windowKeybinds) {
            for (const keybind of windowKeybinds.values()) {
                window.removeEventListener("keydown", keybind.callback);
                window.removeEventListener("keyup", keybind.callback);
            }
            windowKeybinds.clear();
        }
        return true;
    }
}

/**
 * `Keybinds` is a simple utility class for the management of plugin Keybinds. An instance is available on {@link BdApi}.
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
     * Registers a Global Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {string} event Name of the event to register
     * @param {Keys} keys The keys to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {GlobalKeybindOptions} options Options for the Keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    registerGlobalKeybind(pluginName: string, event: string, keys: Keys, callback: () => void, options?: GlobalKeybindOptions) {
        if (this.#callerName) {
            options = callback as unknown as GlobalKeybindOptions;
            callback = keys as unknown as () => void;
            keys = event as unknown as Keys;
            event = pluginName as unknown as string;
            pluginName = this.#callerName;
        }
        try {
            return KeybindsManager.registerGlobalKeybind(pluginName, event, keys, callback, options);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while registering Global Keybind`, e as Error);
            return false;
        }
    }

    /**
     * Registers a Window Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {string} event Name of the event to register
     * @param {Keys} keys The keys to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {WindowKeybindOptions} options Options for the Keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    registerWindowKeybind(pluginName: string, event: string, keys: Keys, callback: () => void, options?: WindowKeybindOptions) {
        if (this.#callerName) {
            options = callback as unknown as WindowKeybindOptions;
            callback = keys as unknown as () => void;
            keys = event as unknown as Keys;
            event = pluginName as unknown as string;
            pluginName = this.#callerName;
        }
        try {
            return KeybindsManager.registerWindowKeybind(pluginName, event, keys, callback, options);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while registering Window Keybind`, e as Error);
            return false;
        }
    }

    /**
     * Unregisters a Global Keybind.
     * @param {string} pluginName Name of the plugin to unregister the Keybind for
     * @param {string} event Name of the event to unregister
     * @returns {boolean} Whether the Keybind was unregistered
     */
    unregisterGlobalKeybind(pluginName: string, event: string) {
        if (this.#callerName) {
            event = pluginName;
            pluginName = this.#callerName;
        }
        try {
            return KeybindsManager.unregisterGlobalKeybind(pluginName, event);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while unregistering Global Keybind`, e as Error);
            return false;
        }
    }

    /**
     * Unregisters a Window Keybind.
     * @param {string} pluginName Name of the plugin to unregister the Keybind for
     * @param {string} event Name of the event to unregister
     * @returns {boolean} Whether the Keybind was unregistered
     */
    unregisterWindowKeybind(pluginName: string, event: string) {
        if (this.#callerName) {
            event = pluginName;
            pluginName = this.#callerName;
        }
        try {
            return KeybindsManager.unregisterWindowKeybind(pluginName, event);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while unregistering Window Keybind`, e as Error);
            return false;
        }
    }

    /**
     * Unregisters all Keybinds for the plugin.
     * @returns {boolean} Whether the Keybinds were unregistered
     */
    unregisterAllKeybinds(pluginName: string) {
        if (this.#callerName) {
            pluginName = this.#callerName;
        }
        try {
            return KeybindsManager.unregisterAllKeybinds(pluginName);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while unregistering all Keybinds`, e as Error);
            return false;
        }
    }
}

Object.freeze(Keybinds);
Object.freeze(Keybinds.prototype);
Object.freeze(Keybinds.constructor);
export default Keybinds;