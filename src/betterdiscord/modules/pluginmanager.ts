import vm from "vm";
import * as sucrase from "sucrase";
import path from "path";

import Logger from "@common/logger";

import Config from "@stores/config";
import Toasts from "@stores/toasts";

import AddonError from "@structs/addonerror";

import AddonManager, {type Addon, type AddonMeta, type AddonStateLoad, type AddonStateLoaded, type AddonStateStart, type AddonStateStop} from "./addonmanager";
import {t} from "@common/i18n";
import Events from "./emitter";

import Modals from "@ui/modals";


export type PluginMeta = AddonMeta;
export interface Plugin extends Addon, PluginMeta {
    exports: any;
    instance: {
        load?(): void;
        start(): void;
        stop(): void;
        observer?(m: MutationRecord): void;
        getSettingsPanel?(): any;
        onSwitch?(): void;
    };
}

export default new class PluginManager extends AddonManager<Plugin> {
    addonList: Plugin[] = [];
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
        return typeof (plugin) == "string" ? this.addonList.find(c => c.id == plugin || c.filename == plugin) : plugin;
    }

    /* Overrides */
    addonFolder(): string {
        return Config.get("pluginsPath");
    }

    validateFileBase(base: string): boolean {
        return base.endsWith(".plugin.js") || base.endsWith(".plugin.mjs") || base.endsWith(".plugin.ts") || base.endsWith(".plugin.mts");
    }

    async initializeAddon(addon: Plugin): Promise<AddonStateLoad> {
        if (!addon.exports || !addon.name) {
            return {
                kind: "not-loaded",
                error: new AddonError(addon.name || addon.filename, addon.filename, "Plugin had no exports or @name property", {message: "Plugin had no exports or no @name property. @name property is required for all addons.", stack: ""}, this.prefix),
            };
        };

        try {
            const isValid = typeof (addon.exports) === "function";
            if (!isValid) {
                return {
                    kind: "not-loaded",
                    error: new AddonError(addon.name || addon.filename, addon.filename, "Plugin not a valid format.", {message: "Plugins should be either a function or a class", stack: ""}, this.prefix),
                };
            };

            const PluginClass = addon.exports;
            const meta = Object.assign({}, addon);
            delete meta.exports;
            const thePlugin = PluginClass.prototype ? new PluginClass(meta) : addon.exports(meta);
            if (!thePlugin.start || !thePlugin.stop) {
                return {
                    kind: "not-loaded",
                    error: new AddonError(addon.name || addon.filename, addon.filename, "Missing start or stop function.", {message: "Plugins must have both a start and stop function.", stack: ""}, this.prefix),
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
                    error: new AddonError(addon.name || addon.filename, addon.filename, "Plugin is missing name, author, description, or version", {message: "Plugin must provide name, author, description, and version.", stack: ""}, this.prefix),
                };
            };
            try {
                if (typeof (addon.instance.load) == "function") addon.instance.load();
            }
            catch (error) {
                this.enablement[addon.id] = false;
                return {
                    kind: "not-loaded",
                    error: new AddonError(addon.name, addon.filename, t("Addons.methodError", {method: "load()"}), {message: (error as Error).message, stack: (error as Error).stack}, this.prefix),
                };
            }
        }
        catch (error) {
            return {
                kind: "not-loaded",
                error: new AddonError(addon.name, addon.filename, t("Addons.methodError", {method: "Plugin constructor()"}), {message: (error as Error).message, stack: (error as Error).stack}, this.prefix),
            };
        }
        return {
            kind: "loaded",
            addon,
        };
    }

    private async runIIFE(addon: Plugin): Promise<void> {
        const module = {filename: addon.filename, exports: {} as any};
        vm.compileFunction(addon.fileContent!, ["require", "module", "exports", "__filename", "__dirname"], {filename: path.basename(addon.filename)});
        addon.fileContent += `\n//# sourceURL=betterdiscord://plugins/${addon.filename}`;
        const wrappedPlugin = new Function("require", "module", "exports", "__filename", "__dirname", addon.fileContent!); // eslint-disable-line no-new-func
        wrappedPlugin(window.require, module, module.exports, module.filename, this.addonFolder);
        if (module.exports.default) {
            module.exports = module.exports.default;
        }
        if (typeof module.exports !== "function") {
            module.exports = addon.name;
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
                error: new AddonError(addon.name || addon.filename, addon.filename, t("Addons.compileError"), {message: (err as Error).message, stack: (err as Error).stack}, this.prefix),
            };
        }
    }

    private async requireESMAddon(loaded: AddonStateLoaded, ts: boolean): Promise<AddonStateLoad> {
        const addon = loaded.addon as Plugin;

        try {
            const transforms: sucrase.Transform[] = ["imports"];
            if (ts) {
                transforms.push("typescript");
            }
            const transformed = sucrase.transform(addon.fileContent!, {transforms});
            addon.fileContent = transformed.code;
            addon.fileContent += `\n//# sourceURL=betterdiscord://plugins/${addon.filename}`;

            await this.runIIFE(addon);

            return {
                kind: "loaded",
                addon,
            };
        }
        catch (err) {
            return {
                kind: "not-loaded",
                error: new AddonError(
                    addon.name || addon.filename,
                    addon.filename,
                    t("Addons.compileError"),
                    {message: (err as Error).message, stack: (err as Error).stack},
                    this.prefix
                ),
            };
        }
    }

    async requireAddon(filename: string): Promise<AddonStateLoad> {
        const requireResult = await super.requireAddon(path.resolve(this.addonFolder(), filename));
        if (requireResult.kind === "not-loaded") return requireResult;
        if (filename.endsWith(".plugin.mjs")) {
            return this.requireESMAddon(requireResult, false);
        }
        else if (filename.endsWith(".plugin.ts") || filename.endsWith(".plugin.mts")) {
            return this.requireESMAddon(requireResult, true);
        }
        return this.requireIIFEAddon(requireResult);
    }

    startAddon(plugin: Plugin) {return this.startPlugin(plugin);}
    stopAddon(plugin: Plugin) {return this.stopPlugin(plugin);}
    getAddon(idOrFile: string) {return this.getPlugin(idOrFile);}

    async startPlugin(plugin: Plugin): Promise<AddonStateStart<Plugin>> {
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
                error: new AddonError(plugin.name, plugin.filename, t("Addons.methodError", {method: "start()"}), {message: (err as Error).message, stack: (err as Error).stack}, this.prefix),
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
                error: new AddonError(plugin.name, plugin.filename, t("Addons.enabled", {method: "stop()"}), {message: (err as Error).message, stack: (err as Error).stack}, this.prefix),
            };
        }
        this.trigger("stopped", plugin.id);
        Toasts.error(t("Addons.disabled", {name: plugin.name, version: plugin.version}));
        return {
            kind: "stopped",
        };
    }

    getPlugin(idOrFile: string) {
        const addon = this.addonList.find(c => c.id == idOrFile || c.filename == idOrFile);
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
        for (let i = 0; i < this.addonList.length; i++) {
            if (!this.enablement[this.addonList[i].id]) continue;
            const plugin = this.addonList[i].instance;
            try {
                if (typeof plugin?.onSwitch === "function") {
                    plugin.onSwitch();
                }
            }
            catch (err) {Logger.stacktrace(this.name, `Unable to fire onSwitch for ${this.addonList[i].name} v${this.addonList[i].version}`, err as Error);}
        }
    }

    onMutation(mutation: MutationRecord) {
        for (let i = 0; i < this.addonList.length; i++) {
            if (!this.enablement[this.addonList[i].id]) continue;
            const plugin = this.addonList[i].instance;
            try {
                if (typeof plugin?.observer === "function") {
                    plugin.observer(mutation);
                }
            }
            catch (err) {Logger.stacktrace(this.name, `Unable to fire observer for ${this.addonList[i].name} v${this.addonList[i].version}`, err as Error);}
        }
    }
};