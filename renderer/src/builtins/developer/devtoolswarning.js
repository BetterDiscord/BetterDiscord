import Builtin from "../../structs/builtin";
import WebpackModules from "../../modules/webpackmodules";
// import IPC from "../../modules/ipc";

export default new class StopDevToolsWarning extends Builtin {
    get name() {return "StopDevToolsWarning";}
    get category() {return "developer";}
    get id() {return "devToolsWarning";}

    enabled() {
        // IPC.stopDevtoolsWarning();
        window?.DiscordNative?.window?.setDevtoolsCallbacks(null, null);
    }

    disabled() {
        const devtoolsModule = WebpackModules.getByString("setDevtoolsCallbacks");
        const stringModule = WebpackModules.getByProps("Messages");
        const hideModule = WebpackModules.getModule(m => Object.keys(m).some(k => k.startsWith("hide")));
        if (!devtoolsModule || !stringModule || !hideModule) return;
        devtoolsModule(stringModule, hideModule, window?.DiscordNative);
    }
};