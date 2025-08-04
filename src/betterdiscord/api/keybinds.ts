import Logger from "@common/logger";
import KeybindsManager, {mapKeysToAccelerator} from "@modules/keybindsmanager";

type Keys = string[];
type Shortcut = Electron.Accelerator | Keys;

type RegisterGlobalArgs = [keys: Keys, callback: () => void];
type RegisterGlobalKeybind<Bounded extends boolean> = Bounded extends true ? RegisterGlobalArgs : [pluginName: string, ...RegisterGlobalArgs];

type UnregisterArgs = [keys: Keys];
type UnregisterKeybind<Bounded extends boolean> = Bounded extends true ? UnregisterArgs : [pluginName: string, ...UnregisterArgs];

type UnregisterAllArgs = [];
type UnregisterAllKeybinds<Bounded extends boolean> = Bounded extends true ? UnregisterAllArgs : [pluginName: string];

function shortcutToAccelerator(keys: unknown): Electron.Accelerator | undefined {
    let accelerator: Electron.Accelerator | undefined;
    if (typeof keys === "string") {
        if (!keys) {
            return accelerator;
        }
        return keys as Electron.Accelerator;
    }
    else if (Array.isArray(keys) && keys.length > 0) {
        if (keys.some(key => typeof key !== "string")) {
            return accelerator;
        }
        return mapKeysToAccelerator(keys as Keys);
    }
}

/**
 * `Keybinds` is a simple utility class for the management of plugin Keybinds. An instance is available on {@link BdApi}.
 * @type Keybinds
 * @summary {@link Keybinds} is a simple utility class for the management of plugin Keybinds.
 * @name Keybinds
 */
export class Keybinds<Bounded extends boolean> {
    #callerName = "";

    constructor(callerName?: string) {
        if (callerName) {this.#callerName = callerName;}
        KeybindsManager.initializePlugin(this.#callerName);
    }

    /**
     * Registers a Global Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {Electron.Accelerator | Keys} keys The keys to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {GlobalKeybindOptions} options Options for the Keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    async register(...args: RegisterGlobalKeybind<Bounded>) {
        let pluginName: string;
        let keys: Shortcut;
        let callback: () => void;

        if (args.length === 2) {
            pluginName = this.#callerName;
            [keys, callback] = args as unknown as [Keys, () => void];
        }
        else if (args.length === 3) {
            [pluginName, keys, callback] = args as unknown as [string, Shortcut, () => void];
        }
        else {
            throw new Error("Invalid arguments for registering Global Keybind. Expected either [keys, callback] or [pluginName, keys, callback].");
        }
        try {
            const accelerator = shortcutToAccelerator(keys);
            if (!accelerator) {
                throw new Error("Keybinds: Invalid keys provided for registering Global Keybind");
            }
            return await KeybindsManager.registerGlobalAccelerator(pluginName, accelerator, callback);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while registering Global Keybind`, e as Error);
            return false;
        }
    }

    /**
     * Unregisters a Global Keybind.
     * @param {string} pluginName Name of the plugin to unregister the Keybind for
     * @param {Keys} keys The keys to unregister
     */
    unregister(...args: UnregisterKeybind<Bounded>) {
        let pluginName: string;
        let keys: Shortcut;
        if (args.length === 1) {
            pluginName = this.#callerName;
            keys = args[0] as Keys;
        }
        else if (args.length === 2) {
            [pluginName, keys] = args;
        }
        else {
            throw new Error("Invalid arguments for unregistering Global Keybind. Expected either [keys] or [pluginName, keys].");
        }
        try {
            const accelerator = shortcutToAccelerator(keys);
            if (!accelerator) {
                throw new Error("Keybinds: Invalid keys provided for unregistering Global Keybind");
            }
            KeybindsManager.unregisterGlobalAccelerator(pluginName, accelerator);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while unregistering Global Keybind`, e as Error);
        }
    }

    /**
     * Unregisters all Keybinds for the plugin.
     * @param {string} pluginName Name of the plugin to unregister the Keybinds for
     */
    unregisterAllKeybinds(...args: UnregisterAllKeybinds<Bounded>) {
        let pluginName: string;
        if (this.#callerName) {
            pluginName = this.#callerName;
        }
        else {
            if (args.length !== 1) {
                throw new Error("Invalid arguments for unregisterAllKeybinds. Expected [pluginName].");
            }
            [pluginName] = args;
        }
        try {
            KeybindsManager.unregisterAllGlobalAccelerators(pluginName);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while unregistering all Keybinds`, e as Error);
        }
    }
}

Object.freeze(Keybinds);
Object.freeze(Keybinds.prototype);
Object.freeze(Keybinds.constructor);
export default Keybinds;