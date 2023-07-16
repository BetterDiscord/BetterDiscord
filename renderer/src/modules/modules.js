import DiscordModules from "./discordmodules";
import Events from "./emitter";

export {default as WebpackModules} from "./webpackmodules";

// import DiscordModules from "./discordmodules";
const makeProxy = name => new Proxy({}, {
    get(_, key) {
        return DiscordModules[name][key];
    },
    set(_, key, value) {
        return DiscordModules[name][key] = value;
    }
})

export const React = makeProxy("React");
export const ReactDOM = makeProxy("ReactDOM");

export {Events, DiscordModules};

export {default as Utilities} from "./utilities";
export {default as DataStore} from "./datastore";
export {default as Settings} from "./settingsmanager";
export {default as DOMManager} from "./dommanager";
export {default as Patcher} from "./patcher";
export {default as LocaleManager} from "./localemanager";
export {default as Strings} from "./strings";
export {default as IPC} from "./ipc";
export {default as Logger} from "common/logger";
export {default as DiscordClasses} from "./discordclasses";
