import {SettingsCookie} from "data";
import Utilities from "../modules/utilities";
import Events from "../modules/emitter";

export function onSettingChange(category, identifier, onEnable, onDisable) {
    const handler = (cat, id, enabled) => {
        if (category !== cat || id !== identifier) return;
        if (enabled) onEnable();
        else onDisable();
    };
    Events.on("setting-updated", handler);
    return () => {Events.off("setting-updated", handler);};
}

export default class BuiltinModule {

    get name() {return "Unnamed Builtin";}
    get category() {return "Modules";}
    get id() {return "None";}

    async initialize() {
        if (SettingsCookie[this.id]) await this.enable();
        Events.on("setting-updated", (category, id, enabled) => {
            if (category !== this.category || id !== this.id) return;
            if (enabled) this.enable();
            else this.disable();
        });
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
        Utilities.log(this.name, ...message);
    }

    warn(...message) {
        Utilities.warn(this.name, ...message);
    }

    error(...message) {
        Utilities.err(this.name, ...message);
    }
}