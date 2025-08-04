import ipc from "@modules/ipc";

type Keys = string[];

/**
 * Maps an array of event.keys to an accelerator string.
 * @param {Keys} keys Array of keys to map
 * @returns {Electron.Accelerator} The accelerator string representing the keys
 */
export function mapKeysToAccelerator(keys: Keys): Electron.Accelerator {
    // TODO: Add support for more numpad keys
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


/**
 * `KeybindsManager` is a class that manages the registration and unregistration of Keybinds.
 * It handles global Keybinds.
 * @type KeybindsManager
 * @summary {@link KeybindsManager} is a class that manages the registration and unregistration of Keybinds.
 * @name KeybindsManager
 */
export default new class KeybindsManager {
    globalAccelerators: Map<string, Set<Electron.Accelerator>>;

    constructor() {
        this.globalAccelerators = new Map();
    }

    /**
     * Initializes the KeybindsManager for the plugin.
     * @param {string} pluginName Name of the plugin to initialize the KeybindsManager for
     */
    initializePlugin(pluginName: string) {
        if (this.globalAccelerators.has(pluginName)) {
            this.unregisterAllGlobalAccelerators(pluginName);
        }
        else {
            this.globalAccelerators.set(pluginName, new Set());
        }
    }

    /**
     * Unregisters all Global Accelerators for all plugins.
     */
    unregisterAllPluginsGlobalAccelerators() {
        for (const [, accelerators] of this.globalAccelerators) {
            for (const accelerator of accelerators) {
                ipc.unregisterGlobalShortcut(accelerator);
            }
            accelerators.clear();
        }
    }

    /**
     * Unregisters all Accelerators for the plugin.
     * @param {string} pluginName Name of the plugin to unregister the Accelerators for
     */
    unregisterAllGlobalAccelerators(pluginName: string) {
        const accelerators = this.globalAccelerators.get(pluginName);
        if (!accelerators) throw new Error("KeybindsManager: No accelerators Map found for the plugin " + pluginName);

        ipc.unregisterAllGlobalShortcuts();
        accelerators.clear();
    }

    /**
     * Registers a global Accelerator.
     * @param {string} pluginName Name of the plugin to register the Accelerator for
     * @param {string} accelerator The accelerator to register
     * @param {Function} callback The callback to call when the accelerator is triggered
     * @returns {boolean} Whether the Accelerator was registered
     */
    async registerGlobalAccelerator(pluginName: string, accelerator: Electron.Accelerator, callback: () => void) {
        const accelerators = this.globalAccelerators.get(pluginName);
        if (!accelerators) throw new Error("KeybindsManager: No accelerators Map found for the plugin " + pluginName);

        if (await ipc.registerGlobalShortcut(accelerator, callback)) {
            accelerators.add(accelerator);
            return true;
        }
        return false;
    }

    /**
     * Unregisters a global Accelerator.
     * @param {string} pluginName Name of the plugin to unregister the Accelerator for
     * @param {string[]} accelerator The Accelerator to unregister
     * @returns {boolean} Whether the Accelerator was unregistered
     */
    unregisterGlobalAccelerator(pluginName: string, accelerator: Electron.Accelerator) {
        const accelerators = this.globalAccelerators.get(pluginName);
        if (!accelerators) throw new Error("KeybindsManager: No accelerators Map found for the plugin " + pluginName);

        ipc.unregisterGlobalShortcut(accelerator);
        accelerators.delete(accelerator);
    }
};