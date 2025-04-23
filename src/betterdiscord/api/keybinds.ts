import {getByKeys, getModule} from "@webpack";

type Keybind = {event: string, keys: any[], callback: () => void;};

type KeybindKey = [0, number];
type KeybindOptions = {
    blurred: boolean;
    focused: boolean;
    keydown: boolean;
    keyup: boolean;
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

export function remapKeyCode(keyCode: number, location: number) {
    if (keyCode === 18 || keyCode === 17 || keyCode === 16) {
        let key = "";
        if (location === 2) {
            key = "right ";
        }
        if (keyCode == 18) key += "alt";
        if (keyCode == 17) key += "ctrl";
        if (keyCode == 16) key += "shift";
        keyCode = keybindModule[key];
    }

    return keyCode;
};

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
    inputEventRegister(id: number, keys: KeybindKey[], callback: () => void, options: KeybindOptions): undefined;
    inputEventUnregister(id: number): undefined;
};

class keybindsManager {
    static startId: number = 1000;
    static keybinds: Map<string, Map<number, Keybind>> = new Map();

    static bindPlugin(pluginName: string): Map<number, Keybind> {
        if (this.keybinds.has(pluginName)) {
            this.unregisterAllKeybinds(pluginName);
        }
        const map = new Map();
        this.keybinds.set(pluginName, map);
        return map;
    };

    static convertToKeybindKeys(keys: any[]): KeybindKey[][] {
        if (!keys || keys.length === 0) return [];
        if (typeof keys[0] === "number") {
            const bindKeys: KeybindKey[] = [];
            keys.forEach((key) => {
                bindKeys.push([0, key]);
            });
            return [bindKeys];
        }
        else if (typeof keys[0] === "string") {
            // Create all possible key combinations based on special keys like shift and ctrl
            const mappedKeybinds: KeybindKey[][] = [];
            const specialKeys: any[] = [];
            const normalKeys: any[] = [];

            // First identify special keys and regular keys
            keys.forEach((key) => {
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
                const combination: KeybindKey[] = [];
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

    /**
     * Registers a Keybind.
     *
     * @param {string} event Name of the event to register
     * @param {Array<any>} keys The keybinds to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {Object} options Options for the keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    static registerKeybind(pluginName: string, event: string, keys: any[], callback: () => void, options: KeybindOptions) {
        const toBind = this.convertToKeybindKeys(keys);
        toBind.forEach((keystoBind) => {
            const id = this.startId++;
            this.keybinds.get(pluginName)?.set(id, {event, keys: keystoBind, callback});
            DiscordUtils.inputEventRegister(id, keystoBind, callback, options);
        });
    }

    /**
     * Unregisters a Keybind.
     *
     * @param {string} event Name of the event to unregister
     * @returns {boolean} Whether the Keybind was unregistered
     */
    static unregisterKeybind(pluginName: string, event: string) {
        const keybinds = this.keybinds.get(pluginName);
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
     * Unregisters all Keybinds for the plugin.
     *
     * @returns {boolean} Whether the Keybinds were unregistered
     */
    static unregisterAllKeybinds(pluginName: string) {
        const keybinds = this.keybinds.get(pluginName);
        keybinds?.forEach((keybind, id) => {
            DiscordUtils.inputEventUnregister(id);
            keybinds.delete(id);
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

    boundKeybinds: Map<number, Keybind>;

    constructor(callerName?: string) {
        this.#callerName = callerName || "BD";
        this.boundKeybinds = keybindsManager.bindPlugin(this.#callerName);
    }

    /**
     * Registers a Keybind.
     *
     * @param {Array<any>} keys The keybinds to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {Object} options Options for the keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    registerKeybind(pluginName: string, event: string, keys: any[] | any, callback: () => void | any, options: KeybindOptions | any) {
        if (this.#callerName) {
            options = callback;
            callback = keys;
            keys = event;
            event = pluginName;
            pluginName = this.#callerName;
        }
        return keybindsManager.registerKeybind(pluginName, event, keys, callback, options);
    };

    /**
     * Unregisters a Keybind.
     *
     * @param {string} event Name of the event to unregister
     * @returns {boolean} Whether the Keybind was unregistered
     */
    unregisterKeybind(pluginName: string, event: string) {
        if (this.#callerName) {
            event = pluginName;
            pluginName = this.#callerName;
        }
        return keybindsManager.unregisterKeybind(pluginName, event);
    }

    /**
     * Unregisters all Keybinds for the plugin.
     *
     * @returns {boolean} Whether the Keybinds were unregistered
     */
    unregisterAllKeybinds() {
        if (this.#callerName) {
            keybindsManager.unregisterAllKeybinds(this.#callerName);
            return true;
        }
        return false;
    }
}

Object.freeze(Keybinds);
Object.freeze(Keybinds.prototype);
Object.freeze(Keybinds.constructor);
export default Keybinds;