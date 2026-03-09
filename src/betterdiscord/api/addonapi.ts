import type {AddonAny} from "@modules/addon";
import type {default as AddonManager} from "@modules/addonmanager";
import type {AddonStateLoad, AddonStateStart, AddonStateStarted, AddonStateStop} from "@modules/addonstate";
import type {default as PluginManager} from "@modules/pluginmanager";
import type {default as ThemeManager} from "@modules/thememanager";

/**
 * `AddonAPI` is a utility class for working with plugins and themes. Instances are accessible through the {@link BdApi}.
 * @name AddonAPI
 */
class AddonAPI<A extends AddonAny> {
    #manager: AddonManager<A>;

    constructor(manager: typeof PluginManager | typeof ThemeManager) {this.#manager = manager as unknown as AddonManager<A>;}

    /**
     * The path to the addon folder.
     * @type {string}
     */
    get folder(): string {return this.#manager.addonFolder();}

    /**
     * Determines if a particular addon is enabled.
     * @param {string} idOrFile Addon ID or filename
     * @returns {boolean}
     */
    isEnabled(idOrFile: string): boolean {return this.#manager.isEnabled(idOrFile);}

    /**
     * Enables the given addon.
     * @param {A} addon Addon instance
     * @returns {Promise<AddonStateStart<A>>}
     */
    enable(addon: A): Promise<AddonStateStart<A>> {return this.#manager.enableAddon(addon);}

    /**
     * Disables the given addon.
     * @param {A} addon Addon instance
     * @return {Promise<AddonStateStop>}
     */
    disable(addon: A): Promise<AddonStateStop> {return this.#manager.disableAddon(addon);}

    /**
     * Toggles if a particular addon is enabled.
     * @param {A} addon Addon instance
     * @returns {Promise<AddonStateStop | AddonStateStart<A>>}
     */
    toggle(addon: A): Promise<AddonStateStop | AddonStateStart<A>> {return this.#manager.toggleAddon(addon);}

    /**
     * Reloads if a particular addon is enabled.
     * @param {A} addon Addon instance
     * @returns {Promise<AddonStateLoad | AddonStateStarted<A>>}
     */
    reload(addon: A): Promise<AddonStateLoad | AddonStateStarted<A>> {
        return this.#manager.reloadAddon(addon);
    }

    /**
     * Gets a particular addon.
     * @param {string} idOrFile Addon ID or filename
     * @returns {A} Addon instance
     */
    get(idOrFile: string) {return this.#manager.getAddon(idOrFile);}

    /**
     * Gets all addons of this type.
     * @returns {A[]} Array of all addon instances
     */
    getAll(): A[] {return Object.values(this.#manager.cacheByName);}
}

Object.freeze(AddonAPI);
Object.freeze(AddonAPI.prototype);

export default AddonAPI;