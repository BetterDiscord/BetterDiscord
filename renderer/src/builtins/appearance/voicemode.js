import Builtin from "../../structs/builtin";

export default new class VoiceMode extends Builtin {
    get name() {return "VoiceMode";}
    get category() {return "appearance";}
    get id() {return "voiceMode";}

    enabled() {
        document.querySelector(".chat-3bRxxu").style.setProperty("visibility", "hidden");
        document.querySelector(".chat-3bRxxu").style.setProperty("min-width", "0px");
        document.querySelector(".channels-Ie2l6A").style.setProperty("flex-grow", "100000");
    }

    disabled() {
        document.querySelector(".chat-3bRxxu").style.setProperty("visibility", "");
        document.querySelector(".chat-3bRxxu").style.setProperty("min-width", "");
        document.querySelector(".channels-Ie2l6A").style.setProperty("flex-grow", "");
    }
};