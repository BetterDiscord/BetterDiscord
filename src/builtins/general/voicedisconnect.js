import Builtin from "../../structs/builtin";
import {DiscordModules} from "modules";

export default new class VoiceDisconnect extends Builtin {
    get name() {return "VoiceDisconnect";}
    get category() {return "general";}
    get id() {return "voiceDisconnect";}

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