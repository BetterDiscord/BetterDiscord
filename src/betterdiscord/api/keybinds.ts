import Logger from "@common/logger";
import KeybindsManager, {mapKeysToAccelerator} from "@modules/keybindsmanager";
import {isDesktopApp} from "@common/utils/isDesktopApp";

type Keys = string[];
type Shortcut = Electron.Accelerator | Keys;

type RegisterGlobalArgs = [keys: Shortcut, callback: () => void];
type RegisterGlobalArgsBounded = [keybindId: string, ...RegisterGlobalArgs];
type RegisterGlobalKeybind<Bounded extends boolean> = Bounded extends true ? RegisterGlobalArgs | RegisterGlobalArgsBounded : RegisterGlobalArgsBounded;

type UnregisterArgs = [keys: Shortcut];
type UnregisterArgsBounded = [keybindId: string, ...UnregisterArgs];
type UnregisterKeybind<Bounded extends boolean> = Bounded extends true ? UnregisterArgs | UnregisterArgsBounded : UnregisterArgsBounded;

type UnregisterAllArgs = [];
type UnregisterAllArgsBounded = [keybindId: string];
type UnregisterAllKeybinds<Bounded extends boolean> = Bounded extends true ? UnregisterAllArgs | UnregisterAllArgsBounded : UnregisterAllArgsBounded;

function shortcutToAccelerator(keys: Shortcut): Electron.Accelerator | "" {
    if (typeof keys === "string") {
        return keys as Electron.Accelerator;
    }
    else if (Array.isArray(keys) && keys.length > 0) {
        return mapKeysToAccelerator(keys as Keys);
    }
    return "";
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
     * @param {Shortcut} keys The keys to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @param {GlobalKeybindOptions} options Options for the Keybind
     * @returns {boolean} Whether the Keybind was registered
     */
    async register(...args: RegisterGlobalKeybind<Bounded>) {
        if (!isDesktopApp()) {
            throw new Error("Keybinds: register() can only be used in a desktop app environment.");
        }
        let keybindId: string;
        let keys: Shortcut;
        let callback: () => void;

        if (this.#callerName && args.length === 2) {
            keybindId = this.#callerName;
            [keys, callback] = args;
        }
        else if (args.length === 3) {
            [keybindId, keys, callback] = args;
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
     * @param {Shortcut} keys The keys to unregister
     */
    unregister(...args: UnregisterKeybind<Bounded>) {
        if (!isDesktopApp()) {
            throw new Error("Keybinds: unregister() can only be used in a desktop app environment.");
        }
        let keybindId: string;
        let keys: Shortcut;
        if (this.#callerName && args.length === 1) {
            keybindId = this.#callerName;
            [keys] = args;
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
        if (!isDesktopApp()) {
            throw new Error("Keybinds: unregisterAll() can only be used in a desktop app environment.");
        }
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