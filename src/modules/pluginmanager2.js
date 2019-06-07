import {Config} from "data";
import ContentManager from "./contentmanager2";
import Utilities from "./utilities";
import {Toasts, Modals} from "ui";
import ContentError from "../structs/contenterror";

const path = require("path");
const electronRemote = require("electron").remote;

export default new class PluginManager extends ContentManager {
    get name() {return "PluginManager";}
    get moduleExtension() {return ".js";}
    get extension() {return ".plugin.js";}
    get contentFolder() {return path.resolve(Config.dataPath, "plugins");}
    get prefix() {return "plugin";}

    constructor() {
        super();
        this.onSwitch = this.onSwitch.bind(this);
        this.observer = new MutationObserver((mutations) => {
            for (let i = 0, mlen = mutations.length; i < mlen; i++) {
                this.onMutation(mutations[i]);
            }
        });
    }

    /* Aliases */
    updatePluginList() {return this.updateList();}
    loadAllPlugins() {return this.loadAllContent();}
    enablePlugin(idOrContent, fromWatcher = false) {return this.enableContent(idOrContent, fromWatcher);}
    disablePlugin(idOrContent, fromWatcher = false) {return this.disableContent(idOrContent, fromWatcher);}
    togglePlugin(id) {return this.toggleContent(id);}

    loadContent(filename, fromWatcher) {
        const error = this.loadPlugin(filename, fromWatcher);
        if (!fromWatcher) return error;
        if (error) Modals.showContentErrors({plugins: [error]});
    }

    unloadContent(idOrFileOrContent, fromWatcher) {return this.unloadPlugin(idOrFileOrContent, fromWatcher);}

     /* Overrides */
    getContentModification(module, content, meta) {
        module._compile(content, module.filename);
        const didExport = !Utilities.isEmpty(module.exports);
        if (didExport) {
            meta.type = module.exports;
            module.exports = meta;
            return "";
        }
        content += `\nmodule.exports = ${JSON.stringify(meta)};\nmodule.exports.type = ${meta.exports || meta.name};`;
        return content;
    }

    loadPlugin(filename) {
        const content = super.loadContent(filename);
        if (content instanceof ContentError) return content;
        console.log(content);
        if (!content.type) return new ContentError(filename, filename, "Plugin had no exports", {message: "Plugin had no exports or no name property.", stack: ""});
        try {
            const thePlugin = new content.type();
            if (this.contentList.find(c => c.id == content.id)) return new ContentError(content.id, filename, `There is already a plugin with name ${content.id}`);
            content.plugin = thePlugin;
            content.name = content.name || thePlugin.getName();
            content.author = content.author || thePlugin.getAuthor();
            content.description = content.description || thePlugin.getDescription();
            content.version = content.version || thePlugin.getVersion();
            this.contentList.push(content);
            try {
                if (typeof(content.plugin.load) == "function") content.plugin.load();
            }
            catch (error) {
                this.state[content.id] = false;
                return new ContentError(content.name, filename, "load() could not be fired.", {message: error.message, stack: error.stack});
            }
            this.emit("loaded", content.id);
            Toasts.success(`${content.name} was loaded.`);

            if (!this.state[content.id]) return this.state[content.id] = false;
            return this.startPlugin(content);
        }
        catch (error) {return new ContentError(filename, filename, "Could not be constructed.", {message: error.message, stack: error.stack});}
    }

    unloadPlugin(idOrFileOrContent, fromWatcher) {
        const content = typeof(idOrFileOrContent) == "string" ? this.contentList.find(c => c.id == idOrFileOrContent || c.filename == idOrFileOrContent) : idOrFileOrContent;
        if (!content) return false;
        if (this.state[content.id]) this.disablePlugin(content, fromWatcher);
        super.unloadContent(content);
        Toasts.success(`${content.name} was unloaded.`);
        this.emit("unloaded", content.id);
        return true;
    }

    reloadPlugin(filename) {
        this.reloadContent(filename);
    }

    startContent(id) {return this.startPlugin(id);}
    stopContent(id) {return this.stopPlugin(id);}
    startPlugin(idOrContent) {
        const content = typeof(idOrContent) == "string" ? this.contentList.find(p => p.id == idOrContent) : idOrContent;
        if (!content) return;
        const plugin = content.plugin;
        try {
            plugin.start();
            this.emit("started", content.id);
            Toasts.show(`${content.name} v${content.version} has started.`);
        }
        catch (err) {
            this.state[content.id] = false;
            Toasts.error(`${content.name} v${content.version} could not be started.`);
            Utilities.err("Plugins", content.name + " could not be started.", err);
            return new ContentError(content.name, content.filename, "start() could not be fired.", {message: err.message, stack: err.stack});
        }
    }

    stopPlugin(idOrContent) {
        const content = typeof(idOrContent) == "string" ? this.contentList.find(p => p.id == idOrContent) : idOrContent;
        if (!content) return;
        const plugin = content.plugin;
        try {
            plugin.stop();
            this.emit("stopped", content.id);
            Toasts.show(`${content.name} v${content.version} has stopped.`);
        }
        catch (err) {
            this.state[content.id] = false;
            Toasts.error(`${content.name} v${content.version} could not be stopped.`);
            Utilities.err("Plugins", content.name + " could not be stopped.", err);
            return new ContentError(content.name, content.filename, "stop() could not be fired.", {message: err.message, stack: err.stack});
        }
    }

    setupFunctions() {
        electronRemote.getCurrentWebContents().on("did-navigate-in-page", this.onSwitch.bind(this));
        this.observer.observe(document, {
            childList: true,
            subtree: true
        });
    }

    onSwitch() {
        this.emit("page-switch");
        for (let i = 0; i < this.contentList.length; i++) {
            const plugin = this.contentList[i].plugin;
            if (!this.state[this.contentList[i].id]) continue;
            if (typeof(plugin.onSwitch) === "function") {
                try { plugin.onSwitch(); }
                catch (err) { Utilities.err("Plugins", "Unable to fire onSwitch for " + this.contentList[i].name + ".", err); }
            }
        }
    }

    onMutation(mutation) {
        for (let i = 0; i < this.contentList.length; i++) {
            const plugin = this.contentList[i].plugin;
            if (!this.state[this.contentList[i].id]) continue;
            if (typeof plugin.observer === "function") {
                try { plugin.observer(mutation); }
                catch (err) { Utilities.err("Plugins", "Unable to fire observer for " + this.contentList[i].name + ".", err); }
            }
        }
    }
};