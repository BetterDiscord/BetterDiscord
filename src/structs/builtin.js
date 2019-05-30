import {SettingsCookie} from "data";
import Utilities from "../modules/utilities";
import Events from "../modules/emitter";

export default class BuiltinModule {

    get name() {return "Unnamed Builtin";}
    get category() {return "Modules";}
    get id() {return "None";}

    async init() {
        console.log("Init a builtin");
        if (SettingsCookie[this.id]) await this.enable();
        Events.on("setting-updated", async (category, id, enabled) => {
            if (category !== this.category || id !== this.id) return;
            if (enabled) await this.enable();
            else await this.disable();
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

    log(message) {
        Utilities.log(this.name, message);
    }

    warn(message) {
        Utilities.warn(this.name, message);
    }

    error(message) {
        Utilities.err(this.name, message);
    }
}