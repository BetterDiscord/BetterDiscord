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
     * Determines if a particular adon is enabled.
     * @param {string} idOrFile Addon id or filename.
     * @returns {boolean}
     */
    isEnabled(idOrFile) {return this.#manager.isEnabled(idOrFile);}

    /**
     * Enables the given addon.
     * @param {string} idOrFile Addon id or filename.
     */
    enable(idOrAddon) {return this.#manager.enableAddon(idOrAddon);}

    /**
     * Disables the given addon.
     * @param {string} idOrFile Addon id or filename.
     */
    disable(idOrAddon) {return this.#manager.disableAddon(idOrAddon);}

    /**
     * Toggles if a particular addon is enabled.
     * @param {string} idOrFile Addon id or filename.
     */
    toggle(idOrAddon) {return this.#manager.toggleAddon(idOrAddon);}

    /**
     * Reloads if a particular addon is enabled.
     * @param {string} idOrFile Addon id or filename.
     */
    reload(idOrFileOrAddon) {return this.#manager.reloadAddon(idOrFileOrAddon);}

    /**
     * Gets a particular addon.
     * @param {string} idOrFile Addon id or filename.
     * @returns {object} Addon instance
     */
    get(idOrFile) {return this.#manager.getAddon(idOrFile);}

    /**
     * Gets all addons of this type.
     * @returns {Array<object>} Array of all addon instances
     */
    getAll() {return this.#manager.addonList.map(a => this.#manager.getAddon(a.id));}
}

Object.freeze(AddonAPI);
Object.freeze(AddonAPI.prototype);

export default AddonAPI;