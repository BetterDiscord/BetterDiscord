import type AddonManager from "@modules/addonmanager";
import type {Addon} from "@typed/addon";
import {t} from "@common/i18n";
import Toasts from "@stores/toasts";
import AddonSettingsRoute from "@stores/addonsettings";
import Settings from "@ui/settings";

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

    /**
     * Opens the settings page for an addon that implements `getSettingsPanel`.
     * @param idOrFile Addon name, ID, or filename
     * @returns Whether the settings page was opened
     */
    openSettings(idOrFile: string) {
        const addon = this.#manager.resolveAddon(idOrFile);
        if (!addon) return false;

        if (!this.#manager.isEnabled(addon.id)) {
            Toasts.warning(t("Addons.isDisabled", {name: addon.name}));
            return false;
        }

        const instance = (addon as {instance?: {getSettingsPanel?: unknown;};}).instance;
        if (typeof instance?.getSettingsPanel !== "function") {
            Toasts.warning(t("Addons.noSettings", {name: addon.name}));
            return false;
        }

        AddonSettingsRoute.open(this.#manager.prefix, addon.id);
        Settings.openSettingsPage(this.#manager.prefix + "s");
        return true;
    }
}

Object.freeze(AddonAPI);
Object.freeze(AddonAPI.prototype);

export default AddonAPI;