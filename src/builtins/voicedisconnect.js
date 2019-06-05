import Builtin from "../structs/builtin";
import {DiscordModules} from "modules";

export default new class DarkMode extends Builtin {
    get name() {return "VoiceDisconnect";}
    get group() {return "general";}
    get id() {return "bda-dc-0";}

    constructor() {
        super();
        this.beforeUnload = this.beforeUnload.bind(this);
    }

    enabled() {
        window.addEventListener("beforeunload", this.beforeUnload);
    }

    disabled() {
        window.removeEventListener("beforeunload", this.beforeUnload);
    }

    beforeUnload() {
        DiscordModules.ChannelActions.selectVoiceChannel(null, null);
    }
};