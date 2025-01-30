import Builtin from "@structs/builtin";
import WebpackModules from "@modules/webpackmodules";

export default new class Notifications extends Builtin {
    get name() {return "Notifications";}
    get category() {return "general";}
    get id() {return "notifications";}

    constructor() {
        super();
        this.PositionLocationModule = WebpackModules.getBySource("hiddenInput");
        // this.beforeUnload = this.beforeUnload.bind(this);
    }

    enabled() {
        // window.addEventListener("beforeunload", this.beforeUnload);
    }

    disabled() {
        // window.removeEventListener("beforeunload", this.beforeUnload);
    }

    beforeUnload() {
        // DiscordModules.ChannelActions.selectVoiceChannel(null, null);
    }
};