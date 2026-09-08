import type AddonManager from "@modules/addonmanager";
import type {Addon} from "@typed/addon";

/**
 * `AddonAPI` is a utility class for working with plugins and themes. Instances are available on {@link BdApi}.
 */
class AddonAPI<T extends Addon> {
    #manager: AddonManager<T>;

    /** @ignore */
    constructor(manager: AddonManager<T>) {this.#manager = manager;}

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
    enable(idOrFile: string) {return this.#manager.enableAddon(idOrFile);}

    /**
     * Disables the given addon.
     * @param idOrFile Addon ID or filename
     */
    disable(idOrFile: string) {return this.#manager.disableAddon(idOrFile);}

    /**
     * Toggles if a particular addon is enabled.
     * @param idOrFile Addon ID or filename
     */
    toggle(idOrFile: string) {return this.#manager.toggleAddon(idOrFile);}

    /**
     * Reloads a particular addon if it is enabled.
     * @param idOrFile Addon ID or filename
     */
    reload(idOrFile: string) {return this.#manager.reloadAddon(idOrFile);}

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