import Logger from "@common/logger";
import KeybindsManager, {mapKeysToAccelerator} from "@modules/keybindsmanager";

type Keys = string[];
type Shortcut = Electron.Accelerator | Keys;

type RegisterGlobalArgs = [keys: Keys, callback: () => void];
type RegisterGlobalKeybind<Bounded extends boolean> = Bounded extends true ? RegisterGlobalArgs : [keybindId: string, ...RegisterGlobalArgs];

type UnregisterArgs = [keys: Keys];
type UnregisterKeybind<Bounded extends boolean> = Bounded extends true ? UnregisterArgs : [keybindId: string, ...UnregisterArgs];

type UnregisterAllArgs = [];
type UnregisterAllKeybinds<Bounded extends boolean> = Bounded extends true ? UnregisterAllArgs : [keybindId: string];

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
 * `Keybinds` is a simple utility class for the management of Keybinds. An instance is available on {@link BdApi}.
 * @type Keybinds
 * @summary {@link Keybinds} is a simple utility class for the management of Keybinds.
 * @name Keybinds
 */
export class Keybinds<Bounded extends boolean> {
    #callerName = "";

    constructor(callerName?: string) {
        if (!callerName) return;
        this.#callerName = callerName;
        KeybindsManager.initialize(this.#callerName);
    }

    /**
     * Registers a Global Keybind.
     * @param {string} keybindId Name of the Keybind to register
     * @param {Electron.Accelerator | Keys} keys The keys to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {GlobalKeybindOptions} options Options for the Keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    async register(...args: RegisterGlobalKeybind<Bounded>) {
        let keybindId: string;
        let keys: Shortcut;
        let callback: () => void;

        if (this.#callerName && args.length === 2) {
            keybindId = this.#callerName;
            [keys, callback] = args as unknown as [Keys, () => void];
        }
        else if (args.length === 3) {
            [keybindId, keys, callback] = args as unknown as [string, Shortcut, () => void];
        }
        else {
            throw new Error(`Invalid arguments for registering Global Keybind. Expected [${this.#callerName ? "keybindId, " : ""}keys, callback].`);
        }
        try {
            const accelerator = shortcutToAccelerator(keys);
            if (!accelerator) {
                throw new Error("Keybinds: Invalid keys provided for registering Global Keybind");
            }
            return await KeybindsManager.registerGlobalAccelerator(keybindId, accelerator, callback);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${keybindId}] Error while registering Global Keybind`, e as Error);
            return false;
        }
    }

    /**
     * Unregisters a Global Keybind.
     * @param {string} keybindId Name of the Keybind to unregister
     * @param {Keys} keys The keys to unregister
     */
    unregister(...args: UnregisterKeybind<Bounded>) {
        let keybindId: string;
        let keys: Shortcut;
        if (this.#callerName && args.length === 1) {
            keybindId = this.#callerName;
            keys = args[0] as Keys;
        }
        else if (args.length === 2) {
            [keybindId, keys] = args;
        }
        else {
            throw new Error(`Invalid arguments for unregistering Global Keybind. Expected either [${this.#callerName ? "keybindId, " : ""}keys] or [keybindId, keys].`);
        }
        try {
            const accelerator = shortcutToAccelerator(keys);
            if (!accelerator) {
                throw new Error("Keybinds: Invalid keys provided for unregistering Global Keybind");
            }
            KeybindsManager.unregisterGlobalAccelerator(keybindId, accelerator);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${keybindId}] Error while unregistering Global Keybind`, e as Error);
        }
    }

    /**
     * Unregisters all Keybinds for the keybindId.
     * @param {string} keybindId Name of the Keybind to unregister
     */
    unregisterAll(...args: UnregisterAllKeybinds<Bounded>) {
        let keybindId: string;
        if (this.#callerName) {
            keybindId = this.#callerName;
        }
        else if (args.length === 1) {
            [keybindId] = args;
        }
        else {
            throw new Error(`Invalid arguments for unregisterAllKeybinds. Expected [${this.#callerName ? "keybindId" : ""}].`);
        }
        try {
            KeybindsManager.unregisterAllGlobalAccelerators(keybindId);
        }
        catch (e) {
            Logger.stacktrace(this.#callerName, `[${keybindId}] Error while unregistering all Keybinds`, e as Error);
        }
    }
}

Object.freeze(Keybinds);
Object.freeze(Keybinds.prototype);
Object.freeze(Keybinds.constructor);
export default Keybinds;