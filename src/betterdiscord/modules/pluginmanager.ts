import vm from "vm";
import path from "path";

import Logger from "@common/logger";

import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonError from "@structs/addonerror";

import AddonManager from "./addonmanager";
import {t} from "@common/i18n";
import Events from "./emitter";

import Modals from "@ui/modals";
import type {Plugin} from "./plugin";
import type {AddonStateLoad, AddonStateLoaded, AddonStateStart, AddonStateStop} from "./addonstate";

export default new class PluginManager extends AddonManager<Plugin> {
    observer: MutationObserver;
    name = "PluginManager";

    constructor() {
        super(
            "plugin",
            "javascript",
            3,
        );
        this.onSwitch = this.onSwitch.bind(this);
        this.observer = new MutationObserver((mutations) => {
            for (let i = 0, mlen = mutations.length; i < mlen; i++) {
                this.onMutation(mutations[i]);
            }
        });
    }

    async initialize() {
        const errors = await super.initialize();
        this.setupFunctions();
        return errors;
    }

    /* Aliases */
    updatePluginList() {return this.updateList();}

    enablePlugin(plugin: Plugin) {return this.enableAddon(plugin);}
    disablePlugin(plugin: Plugin) {return this.disableAddon(plugin);}
    togglePlugin(plugin: Plugin) {return this.toggleAddon(plugin);}

    unloadPlugin(plugin: Plugin) {return this.unloadAddon(plugin);}
    loadPlugin(filename: string) {return this.loadAddon(filename);}

    async loadAddon(filename: string, shouldCTE = true) {
        const load = await super.loadAddon(filename, shouldCTE);
        if (load.kind === "not-loaded" && shouldCTE) Modals.showAddonErrors({plugins: [load]});
        return load;
    }

    async reloadPlugin(plugin: Plugin) {
        const reload = await this.reloadAddon(plugin);
        if (reload.kind === "not-loaded") Modals.showAddonErrors({plugins: [reload]});
        return typeof (plugin) == "string" ? this.getAddon(plugin) : plugin;
    }

    /* Overrides */
    addonFolder(): string {
        return Config.get("pluginsPath");
    }

    validateFilename(base: string): boolean {
        return base.endsWith(".plugin.js") || base.endsWith(".plugin.mjs");
    }

    async initializeAddon(addon: Plugin): Promise<AddonStateLoad> {
        if (!addon.exports || !addon.name) {
            return {
                kind: "not-loaded",
                error: new AddonError({
                    addonType: this.prefix,
                    addon,
                    message: "Plugin had no exports or @name property",
                }),
            };
        };

        try {
            const isFunc = typeof addon.exports === "function";
            const isObj = typeof addon.exports === "object";
            const isValid = isFunc || isObj;
            if (!isValid) {
                return {
                    kind: "not-loaded",
                    error: new AddonError({
                        addonType: this.prefix,
                        addon,
                        message: "Plugins should be either a function, object or a class"
                    }),
                };
            };

            const PluginClass = addon.exports;
            const meta = Object.assign({}, addon);
            delete meta.exports;
            const thePlugin = isObj ? addon.exports : PluginClass.prototype ? new PluginClass(meta) : addon.exports(meta);
            if (!thePlugin.start || !thePlugin.stop) {
                return {
                    kind: "not-loaded",
                    error: new AddonError({
                        addonType: this.prefix,
                        addon,
                        message: "Plugins must have both a start and stop function."
                    }),
                };
            };

            addon.instance = thePlugin;
            addon.name = thePlugin.getName ? thePlugin.getName() : addon.name;
            addon.author = thePlugin.getAuthor ? thePlugin.getAuthor() : addon.author;
            addon.description = thePlugin.getDescription ? thePlugin.getDescription() : addon.description;
            addon.version = thePlugin.getVersion ? thePlugin.getVersion() : addon.version;
            if (!addon.name || !addon.author || !addon.description || !addon.version) {
                return {
                    kind: "not-loaded",
                    error: new AddonError({
                        addonType: this.prefix,
                        addon,
                        message: "Plugin must provide name, author, description, and version.",
                    }),
                };
            };
            try {
                if (typeof (addon.instance.load) == "function") await addon.instance.load();
            }
            catch (error) {
                this.enablement[addon.id] = false;
                return {
                    kind: "not-loaded",
                    error: new AddonError({
                        addonType: this.prefix,
                        addon,
                        message: t("Addons.methodError", {method: "load()"}),
                        cause: error as Error,
                    }),
                };
            }
        }
        catch (error) {
            return {
                kind: "not-loaded",
                error: new AddonError({
                    addonType: this.prefix,
                    addon,
                    message: t("Addons.methodError", {method: "constructor()"}),
                    cause: error as Error,
                }),
            };
        }
        return {
            kind: "loaded",
            addon,
        };
    }

    private async runIIFE(addon: Plugin): Promise<void> {
        const module = {filename: addon.filename, exports: {} as any};
        const extension = `\n//# sourceURL=betterdiscord://plugins/${addon.filename}`;
        addon.fileContent += extension;
        vm.compileFunction(addon.fileContent!, ["require", "module", "exports", "__filename", "__dirname"], {filename: path.basename(addon.filename)});
        const wrappedPlugin = new Function("require", "module", "exports", "__filename", "__dirname", addon.fileContent!); // eslint-disable-line no-new-func
        await wrappedPlugin(window.require, module, module.exports, module.filename, this.addonFolder());

        if (module.exports.default) {
            module.exports = module.exports.default;
        }
        if (typeof module.exports !== "function" && typeof module.exports !== "object") {
            module.exports = null;
        }
        addon.exports = module.exports;
        delete addon.fileContent;
    }

    private async requireIIFEAddon(loaded: AddonStateLoaded): Promise<AddonStateLoad> {
        const addon = loaded.addon as Plugin;
        try {
            await this.runIIFE(addon);
            return {
                kind: "loaded",
                addon,
            };
        }
        catch (err) {
            return {
                kind: "not-loaded",
                error: new AddonError({
                    addonType: this.prefix,
                    addon,
                    message: t("Addons.compileError"),
                    cause: err as Error,
                }),
            };
        }
    }

    private async requireESMAddon(loaded: AddonStateLoaded): Promise<AddonStateLoad> {
        const addon = loaded.addon as Plugin;

        try {
            addon.exports = await import("bd:addons/plugins/" + addon.filename + "?t=" + Date.now());
            if (addon.exports.default) {
                addon.exports = addon.exports.default;
            }

            return {
                kind: "loaded",
                addon,
            };
        }
        catch (err) {
            return {
                kind: "not-loaded",
                error: new AddonError({
                    addonType: this.prefix,
                    addon,
                    message: t("Addons.compileError"),
                    cause: err as Error,
                }),
            };
        }
    }

    async requireAddon(filename: string): Promise<AddonStateLoad> {
        const requireResult = await super.requireAddon(path.resolve(this.addonFolder(), filename));
        if (requireResult.kind === "not-loaded") return requireResult;
        const plugin = requireResult.addon as Plugin;
        const usesESM = plugin.use && plugin.use.includes("esm");
        if (filename.endsWith(".plugin.mjs") || usesESM) {
            return this.requireESMAddon(requireResult);
        }
        return this.requireIIFEAddon(requireResult);
    }

    startAddon(plugin: Plugin) {return this.startPlugin(plugin);}
    stopAddon(plugin: Plugin) {return this.stopPlugin(plugin);}
    getAddon(idOrFile: string) {return this.getPlugin(idOrFile);}

    async startPlugin(plugin: Plugin): Promise<AddonStateStart<Plugin>> {
        if (typeof plugin === "string") {
            const err = "'BdApi.Plugins.start(string)' is deprecated, use 'BdApi.Plugins.start(BdApi.Plugins.get(id))'.";
            Logger.warn(this.name, err);
            plugin = this.getPlugin(plugin) as Plugin;
            if (!plugin) {
                return {
                    kind: "not-started",
                    error: new AddonError({
                        addonType: this.prefix,
                        addon: {filename: String(plugin)},
                        message: t("Addons.methodError", {method: "start(string)"}),
                        cause: new Error(err),
                    }),
                };
            }
        }
        const instance = plugin.instance;
        try {
            instance.start();
        }
        catch (err) {
            this.enablement[plugin.id] = false;
            this.trigger("disabled", plugin);
            Toasts.warning(t("Addons.couldNotStart", {name: plugin.name, version: plugin.version}));
            Logger.stacktrace(this.name, `${plugin.name} v${plugin.version} could not be started.`, err as Error);
            return {
                kind: "not-started",
                error: new AddonError({
                    addonType: this.prefix,
                    addon: plugin,
                    message: t("Addons.methodError", {method: "start(name)"}),
                    cause: err as Error,
                }),
            };
        }
        this.trigger("started", plugin.id);

        Toasts.success(t("Addons.enabled", {name: plugin.name, version: plugin.version}));
        return {
            kind: "started",
            addon: plugin,
        };
    }

    async stopPlugin(plugin: Plugin): Promise<AddonStateStop> {
        if (typeof plugin === "string") {
            const err = "'BdApi.Plugins.stop(string)' is deprecated, use 'BdApi.Plugins.stop(BdApi.Plugins.get(id))'.";
            Logger.warn(this.name, err);
            plugin = this.getPlugin(plugin) as Plugin;
            if (!plugin) {
                return {
                    kind: "not-stopped",
                    error: new AddonError({
                        addonType: this.prefix,
                        addon: {filename: String(plugin)},
                        message: t("Addons.methodError", {method: "stop(string)"}),
                        cause: new Error(err),
                    }),
                };
            }
        }
        const instance = plugin.instance;
        try {
            instance.stop();
        }
        catch (err) {
            this.enablement[plugin.id] = false;
            Toasts.warning(t("Addons.couldNotStop", {name: plugin.name, version: plugin.version}));
            Logger.stacktrace(this.name, `${plugin.name} v${plugin.version} could not be started.`, err as Error);
            return {
                kind: "not-stopped",
                error: new AddonError({
                    addonType: this.prefix,
                    addon: plugin,
                    message: t("Addons.enabled", {method: "stop()"}),
                    cause: err as Error,
                }),
            };
        }
        this.trigger("stopped", plugin.id);
        Toasts.error(t("Addons.disabled", {name: plugin.name, version: plugin.version}));
        return {
            kind: "stopped",
        };
    }

    getPlugin(idOrFile: string) {
        const addon = super.getAddon(idOrFile);
        if (!addon) return;
        return addon;
    }

    setupFunctions() {
        Events.on("navigate", this.onSwitch);
        this.observer.observe(document, {
            childList: true,
            subtree: true
        });
    }

    onSwitch() {
        for (const id in this.enablement) {
            const plugin = this.getAddon(id);
            if (!plugin) {
                continue;
            }
            const {instance} = plugin;
            const {onSwitch} = instance;
            try {
                if (typeof onSwitch === "function") {
                    onSwitch();
                }
            }
            catch (err) {Logger.stacktrace(this.name, `Unable to fire onSwitch for ${plugin.name} v${plugin.version}`, err as Error);}
        }
    }

    onMutation(mutation: MutationRecord) {
        for (const id in this.enablement) {
            const plugin = this.getAddon(id);
            if (!plugin) {
                continue;
            }
            const {instance} = plugin;
            if (!instance) {
                continue;
            }
            const {observer} = instance;
            try {
                if (typeof observer === "function") {
                    observer(mutation);
                }
            }
            catch (err) {Logger.stacktrace(this.name, `Unable to fire observer for ${plugin.name} v${plugin.version}`, err as Error);}
        }
    }
};