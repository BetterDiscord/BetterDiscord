import AddonStore from "@modules/addonstore";

/**
 * `AddonAPI` is a utility class for working with plugins and themes. Instances are accessible through the {@link BdApi}.
 * @name AddonAPI
 */
 class AddonAPI {
    #manager;

    constructor(manager) {this.#manager = manager;}

    /**
     * The path to the addon folder.
     * @type string
     */
    get folder() {return this.#manager.addonFolder;}

    /**
     * Determines if a particular addon is enabled.
     * @param {string} idOrFile Addon ID or filename
     * @returns {boolean}
     */
    isEnabled(idOrFile) {return this.#manager.isEnabled(idOrFile);}

    /**
     * Enables the given addon.
     * @param {string} idOrFile Addon ID or filename
     */
    enable(idOrAddon) {return this.#manager.enableAddon(idOrAddon);}

    /**
     * Disables the given addon.
     * @param {string} idOrFile Addon ID or filename
     */
    disable(idOrAddon) {return this.#manager.disableAddon(idOrAddon);}

    /**
     * Toggles if a particular addon is enabled.
     * @param {string} idOrFile Addon ID or filename
     */
    toggle(idOrAddon) {return this.#manager.toggleAddon(idOrAddon);}

    /**
     * Reloads if a particular addon is enabled.
     * @param {string} idOrFile Addon ID or filename
     */
    reload(idOrFileOrAddon) {return this.#manager.reloadAddon(idOrFileOrAddon);}

    /**
     * Gets a particular addon.
     * @param {string} idOrFile Addon ID or filename
     * @returns {object} Addon instance
     */
    get(idOrFile) {return this.#manager.getAddon(idOrFile);}

    /**
     * Gets all addons of this type.
     * @returns {Array<object>} Array of all addon instances
     */
    getAll() {return this.#manager.addonList.map(a => this.#manager.getAddon(a.id));}

    /**
     * Attempt to download a plugin
     * @param {string} idOrFile Addon ID or filename
     * @returns {Promise<void>} A empty promise that resolves when the addon is installed or when the modal is closed
     */
    download(idOrFile) {
        return new Promise((resolve, reject) => {
            AddonStore.initializeIfNeeded();
    
            let undo = () => {};
            const listener = () => {
                undo();
    
                const addon = AddonStore.getAddon(idOrFile);
                if (!addon) return reject(new Error("Unknown addon!"));
    
                if (addon.type === this.#manager.prefix) {
                    AddonStore.attemptToDownload(addon, false).then(resolve, reject);
                    return;
                }
                reject(new Error(`Addon is not type '${this.#manager.prefix}'!`));
            };
    
            if (AddonStore.addonList.length === 0) undo = AddonStore.addChangeListener(listener);
            else listener();
        });
    }
}

Object.freeze(AddonAPI);
Object.freeze(AddonAPI.prototype);

export default AddonAPI;