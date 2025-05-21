/* eslint-disable prefer-rest-params */
import Logger from "@common/logger";

import Events from "@modules/emitter";
import Settings from "@stores/settings";
import Patcher from "@modules/patcher";
import CommandManager from "@modules/commandmanager";


export default class BuiltinModule {

    initialized: boolean = false;
    #commands = new Set<() => void>();
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

    registerSetting(collection: string, category: string, id: string, onEnable: () => void, onDisable: () => void) {
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

    get(collection: string, category: string, id: string) {
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
        catch (e) {this.stacktrace("Could not be enabled", e as Error);}
    }

    async disable() {
        this.log("Disabled");
        try {await this.disabled();}
        catch (e) {this.stacktrace("Could not be disabled", e as Error);}
    }

    async enabled() {}
    async disabled() {}

    log(...message: string[]) {
        Logger.log(this.name, ...message);
    }

    warn(...message: string[]) {
        Logger.warn(this.name, ...message);
    }

    error(...message: string[]) {
        Logger.err(this.name, ...message);
    }

    stacktrace(message: string, error: Error) {
        Logger.stacktrace(this.name, message, error);
    }

    before(object: object, func: string, callback: (t: object, a: any[]) => void) {
        return Patcher.before(this.name, object, func as keyof typeof object, callback);
    }

    instead(object: object, func: string, callback: (t: object, a: any[], o: () => void) => void) {
        return Patcher.instead(this.name, object, func as keyof typeof object, callback);
    }

    after(object: object, func: string, callback: (t: object, a: any[], r: any) => void) {
        return Patcher.after(this.name, object, func as keyof typeof object, callback);
    }

    unpatchAll() {
        return Patcher.unpatchAll(this.name);
    }

    // TODO: fix type when commands are properly TS
    addCommands(...commands: object[]) {
        for (const command of commands) {
            const unregister = CommandManager.registerCommand("BetterDiscord", command);
            this.#commands.add(unregister);
        }
    }

    removeCommands() {
        for (const unregister of this.#commands) unregister();
    }
}