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
 * It handles both global Keybinds.
 * @type KeybindsManager
 * @summary {@link KeybindsManager} is a class that manages the registration and unregistration of Keybinds.
 * @name KeybindsManager
 */
export default new class KeybindsManager {
    globalKeybinds: Map<string, Set<string>> = new Map();

    initializePluginKeybindings(pluginName: string) {
        this.initializeGlobalKeybinds(pluginName);
    }

    initializeGlobalKeybinds(pluginName: string) {
        if (this.globalKeybinds.has(pluginName)) {
            this.unregisterAllKeybinds(pluginName);
        }
        else {
            this.globalKeybinds.set(pluginName, new Set<string>());
        }
    }

    unregesterAllPluginsGlobalKeybinds() {
        for (const [, keybinds] of this.globalKeybinds) {
            for (const accelerator of keybinds) {
                ipc.unregisterGlobalShortcut(accelerator);
            }
            keybinds.clear();
        }
    }

    /**
     * Unregisters all Global Keybinds for the plugin.
     * @param {string} pluginName Name of the plugin to unregister the Keybinds for
     */
    unregisterAllGlobalKeybinds(pluginName: string) {
        const keybinds = this.globalKeybinds.get(pluginName);
        if (!keybinds) throw new Error("KeybindsManager: No keybinds Map found for the plugin " + pluginName);

        ipc.unregisterAllGlobalShortcuts();
        keybinds.clear();
    }

    /**
     * Unregisters all Keybinds for the plugin.
     * @param {string} pluginName Name of the plugin to unregister the Keybinds for
     * @returns {boolean} Whether the Keybinds were unregistered
     */
    unregisterAllKeybinds(pluginName: string) {
        this.unregisterAllGlobalKeybinds(pluginName);
    }



    /**
     * Registers a global Keybind.
     * @param {string} pluginName Name of the plugin to register the Keybind for
     * @param {string} keys Name of the event to register
     * @param {Function} callback The callback to call when the keybind is pressed
     * @returns {boolean} Whether the Keybind was registered
     */
    async registerGlobalKeybind(pluginName: string, keys: Keys, callback: () => void) {
        const accelerator = mapKeysToAccelerator(keys);
        const keybinds = this.globalKeybinds.get(pluginName);
        if (!keybinds) throw new Error("KeybindsManager: No keybinds Map found for the plugin " + pluginName);

        return await ipc.registerGlobalShortcut(accelerator, callback);
    }

    /**
     * Unregisters a global Keybind.
     * @param {string} pluginName Name of the plugin to unregister the Keybind for
     * @param {string[]} keys Array of keys to unregister
     * @returns {boolean} Whether the Keybind was unregistered
     */
    unregisterGlobalKeybind(pluginName: string, keys: Keys) {
        const accelerator = mapKeysToAccelerator(keys);
        const keybinds = this.globalKeybinds.get(pluginName);
        if (!keybinds) throw new Error("KeybindsManager: No keybinds Map found for the plugin " + pluginName);

        ipc.unregisterGlobalShortcut(accelerator);
        keybinds.delete(accelerator);
    }
};