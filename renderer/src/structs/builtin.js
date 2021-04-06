import Logger from "common/logger";
import Events from "../modules/emitter";
import Settings from "../modules/settingsmanager";
import Patcher from "../modules/patcher";

export default class BuiltinModule {

    get name() {return "Unnamed Builtin";}
    get collection() {return "settings";}
    get category() {return "general";}
    get id() {return "None";}

    async initialize() {
        if (Settings.get(this.collection, this.category, this.id)) await this.enable();
        Events.on("setting-updated", (collection, category, id, enabled) => {
            if (collection != this.collection || category !== this.category || id !== this.id) return;
            if (enabled) this.enable();
            else this.disable();
        });
        this.initialized = true;
    }

    registerSetting(collection, category, id, onEnable, onDisable) {
        if (arguments.length == 4) {
            collection = this.collection;
            category = arguments[0];
            id = arguments[1];
            onEnable = arguments[2];
            onDisable = arguments[3];
        }
        else if (arguments.length == 3) {
            collection = this.collection;
            category = this.category;
            id = arguments[0];
            onEnable = arguments[1];
            onDisable = arguments[2];
        }
        return Settings.on(collection, category, id, (value) => {
            if (value) onEnable();
            else onDisable();
        });
    }

    get(collection, category, id) {
        if (arguments.length == 2) {
            collection = this.collection;
            category = arguments[0];
            id = arguments[1];
        }
        else if (arguments.length == 1) {
            collection = this.collection;
            category = this.category;
            id = arguments[0];
        }
        return Settings.get(collection, category, id);
    }

    async enable() {
        this.log("Enabled");
        try {await this.enabled();}
        catch (e) {this.stacktrace("Could not be enabled", e);}
    }

    async disable() {
        this.log("Disabled");
        try {await this.disabled();}
        catch (e) {this.stacktrace("Could not be disabled", e);}
    }

    async enabled() {}
    async disabled() {}

    log(...message) {
        Logger.log(this.name, ...message);
    }

    warn(...message) {
        Logger.warn(this.name, ...message);
    }

    error(...message) {
        Logger.err(this.name, ...message);
    }

    stacktrace(message, error) {
        Logger.stacktrace(this.name, message, error);
    }

    before(object, func, callback) {
        return Patcher.before(this.name, object, func, callback);
    }

    instead(object, func, callback) {
        return Patcher.instead(this.name, object, func, callback);
    }

    after(object, func, callback) {
        return Patcher.after(this.name, object, func, callback);
    }

    unpatchAll() {
        return Patcher.unpatchAll(this.name);
    }
}