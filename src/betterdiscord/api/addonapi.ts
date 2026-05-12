import type AddonManager from "@modules/addonmanager";

/**
 * `AddonAPI` is a utility class for working with plugins and themes. Instances are accessible through the {@link BdApi}.
 */
class AddonAPI {
    #manager: AddonManager;

    constructor(manager: AddonManager) {this.#manager = manager;}

    /**
     * The path to the addon folder.
     */
    get folder() {return this.#manager.addonFolder;}

    /**
     * Determines if a particular addon is enabled.
     * @param idOrFile Addon ID or filename
     */
    isEnabled(idOrFile: string) {return this.#manager.isEnabled(idOrFile);}

    /**
     * Enables the given addon.
     * @param idOrFile Addon ID or filename
     */
    enable(idOrAddon: string) {return this.#manager.enableAddon(idOrAddon);}

    /**
     * Disables the given addon.
     * @param idOrFile Addon ID or filename
     */
    disable(idOrAddon: string) {return this.#manager.disableAddon(idOrAddon);}

    /**
     * Toggles if a particular addon is enabled.
     * @param idOrFile Addon ID or filename
     */
    toggle(idOrAddon: string) {return this.#manager.toggleAddon(idOrAddon);}

    /**
     * Reloads a particular addon if it is enabled.
     * @param idOrFile Addon ID or filename
     */
    reload(idOrFileOrAddon: string) {return this.#manager.reloadAddon(idOrFileOrAddon);}

    /**
     * Gets a particular addon.
     * @param idOrFile Addon ID or filename
     * @returns Addon instance
     */
    get(idOrFile: string) {return this.#manager.resolveAddon(idOrFile);}

    /**
     * Gets all addons of this type.
     * @returns Array of all addon instances
     */
    getAll() {return this.#manager.addonList.map(a => this.#manager.resolveAddon(a.id));}
}

Object.freeze(AddonAPI);
Object.freeze(AddonAPI.prototype);

export default AddonAPI;