import Logger from "../modules/logger";
import Events from "../modules/emitter";
import Settings from "../modules/settingsmanager";

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
        await this.enabled();
    }

    async disable() {
        this.log("Disabled");
        await this.disabled();
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
}