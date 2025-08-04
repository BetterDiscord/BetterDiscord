import ipc from "@modules/ipc";

type Keys = string[];

/**
 * Maps an array of event.keys to an accelerator string.
 * @param {Keys} keys Array of keys to map
 * @returns {Electron.Accelerator} The accelerator string representing the keys
 */
export function mapKeysToAccelerator(keys: Keys): Electron.Accelerator | "" {
    // TODO: Add support for numpad keys
    if (!keys || keys.length === 0) return "";
    keys = keys.map((key) => {
        if (key.length === 1) {
            if (key === " ") return "Space";
            return key.toUpperCase();
        }
        else if (key === "Control") {
            return "CmdOrCtrl";
        }
        else if (key.startsWith("AudioVolume")) {
            return key.replace("AudioVolume", "Volume");
        }
        else if (key.startsWith("Media")) {
            if (key === "MediaTrackNext") return "MediaNextTrack";
            if (key === "MediaTrackPrevious") return "MediaPreviousTrack";
        }
        return key;
    });
    return keys.join("+");
}

const shortcutMap: Map<string, () => void> = new Map();
export function callCallback(_event: Electron.IpcRendererEvent, accelerator: string) {
    const callback = shortcutMap.get(accelerator);
    if (callback) {
        callback();
    }
}

/**
 * `KeybindsManager` is a class that manages the registration and unregistration of Keybinds.
 * It handles global Keybinds.
 * @type KeybindsManager
 * @summary {@link KeybindsManager} is a class that manages the registration and unregistration of Keybinds.
 * @name KeybindsManager
 */
export class KeybindsManager {
    globalAccelerators: Map<string, Set<Electron.Accelerator>>;

    constructor() {
        this.globalAccelerators = new Map();
    }

    /**
     * Initializes the KeybindsManager for the keybindId.
     * @param {string} keybindId Name of the keybind to initialize the KeybindsManager for
     */
    initialize(keybindId: string) {
        if (this.globalAccelerators.has(keybindId)) {
            this.unregisterAllGlobalAccelerators(keybindId);
        }
        else {
            this.globalAccelerators.set(keybindId, new Set());
        }
    }

    /**
     * Registers a global Accelerator.
     * @param {string} keybindId Name of the keybind to register the Accelerator for
     * @param {string} accelerator The accelerator to register
     * @param {Function} callback The callback to call when the accelerator is triggered
     * @returns {boolean} Whether the Accelerator was registered
     */
    async registerGlobalAccelerator(keybindId: string, accelerator: Electron.Accelerator, callback: () => void) {
        if (!this.globalAccelerators.has(keybindId)) {
            this.initialize(keybindId);
        }
        const accelerators = this.globalAccelerators.get(keybindId);
        if (!accelerators) throw new Error("KeybindsManager: No accelerators Map found for the keybind " + keybindId);

        if (await ipc.registerGlobalShortcut(accelerator)) {
            accelerators.add(accelerator);
            shortcutMap.set(accelerator, callback);
            return true;
        }
        return false;
    }

    /**
     * Unregisters a global Accelerator.
     * @param {string} keybindId Name of the keybind to unregister the Accelerator for
     * @param {string[]} accelerator The Accelerator to unregister
     * @returns {boolean} Whether the Accelerator was unregistered
     */
    unregisterGlobalAccelerator(keybindId: string, accelerator: Electron.Accelerator) {
        const accelerators = this.globalAccelerators.get(keybindId);
        if (!accelerators) throw new Error("KeybindsManager: No accelerators Map found for the keybind " + keybindId);

        ipc.unregisterGlobalShortcut(accelerator);
        accelerators.delete(accelerator);
        shortcutMap.delete(accelerator);
    }

    /**
     * Unregisters all Accelerators for the keybind.
     * @param {string} keybindId Name of the keybind to unregister the Accelerators for
     */
    unregisterAllGlobalAccelerators(keybindId: string) {
        const accelerators = this.globalAccelerators.get(keybindId);
        if (!accelerators) throw new Error("KeybindsManager: No accelerators Map found for the keybind " + keybindId);

        const acceleratorsArray: string[] = Array.from(accelerators);
        ipc.unregisterAllGlobalShortcuts(acceleratorsArray);
        accelerators.clear();
        for (const accelerator of acceleratorsArray) {
            shortcutMap.delete(accelerator);
        }
    }
};

export default new KeybindsManager();