import Logger from "@common/logger";
import KeybindsManager from "@modules/keybindsmanager";

type Keys = string[];

type RegisterGlobalArgs = [keys: Keys, callback: () => void];
type RegisterGlobalKeybind<Bounded extends boolean> = Bounded extends true ? [pluginName: string] | RegisterGlobalArgs : RegisterGlobalArgs;

type UnregisterArgs = [pluginName: string, keys: Keys] | [keys: Keys];
type UnregisterKeybind<Bounded extends boolean> = Bounded extends true ? [pluginName: string] | UnregisterArgs : UnregisterArgs;


/**
 * `Keybinds` is a simple utility class for the management of plugin Keybinds. An instance is available on {@link BdApi}.
 * @type Keybinds
 * @summary {@link Keybinds} is a simple utility class for the management of plugin Keybinds.
 * @name Keybinds
 */
export class Keybinds<Bounded extends boolean> {
    #callerName = "";

    constructor(callerName?: string) {
        if (!callerName) return;
        this.#callerName = callerName;
        KeybindsManager.initializePluginKeybindings(this.#callerName);
    }

    /**
     * Registers a Global Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {Keys} keys The keys to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {GlobalKeybindOptions} options Options for the Keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    async registerGlobalKeybind(...args: RegisterGlobalKeybind<Bounded>) {
        let pluginName: string;
        let keys: Keys;
        let callback: () => void;

        if (this.#callerName) {
            pluginName = this.#callerName;
            [keys, callback] = args as unknown as [Keys, () => void];
        }
        else {
            [pluginName, keys, callback] = args as unknown as [string, Keys, () => void];
        }
        try {
            if (!keys || keys.length === 0) {
                throw new Error("Keybinds: No keys provided for Global Keybind");
            }
            return await KeybindsManager.registerGlobalKeybind(pluginName, keys, callback);
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
    unregisterGlobalKeybind(...args: UnregisterKeybind<Bounded>) {
        let pluginName: string;
        let keys: Keys;
        if (this.#callerName && args.length === 1) {
            pluginName = this.#callerName;
            keys = args[0] as Keys;
        }
        else if (args.length === 2) {
            [pluginName, keys] = args;
        }
        else {
            throw new Error("Invalid arguments for unregisterWindowKeybind. Expected either [eventName] or [pluginName, eventName].");
        }
        try {
            if (!keys || keys.length === 0) {
                throw new Error("Keybinds: No keys provided for unregistering Global Keybind");
            }
            KeybindsManager.unregisterGlobalKeybind(pluginName, keys);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${pluginName}] Error while unregistering Global Keybind`, e as Error);
        }
    }

    /**
     * Unregisters all Keybinds for the plugin.
     * @param {string} pluginName Name of the plugin to unregister the Keybinds for
     */
    unregisterAllKeybinds(pluginName: string) {
        if (this.#callerName) {
            pluginName = this.#callerName;
        }
        try {
            KeybindsManager.unregisterAllKeybinds(pluginName);
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