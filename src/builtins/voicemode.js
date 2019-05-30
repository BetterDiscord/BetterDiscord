import Builtin from "../structs/builtin";

export default new class VoiceMode extends Builtin {
    get name() {return "VoiceMode";}
    get category() {return "Modules";}
    get id() {return "bda-gs-4";}

    enabled() {
        $(".scroller.guild-channels ul").first().css("display", "none");
        $(".scroller.guild-channels header").first().css("display", "none");
        $(".app.flex-vertical, .app-2rEoOp").first().css("overflow", "hidden");
        $(".chat-3bRxxu").first().css("visibility", "hidden").css("min-width", "0px");
        $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
        $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
    }

    disabled() {
        $(".scroller.guild-channels ul").first().css("display", "");
        $(".scroller.guild-channels header").first().css("display", "");
        $(".app.flex-vertical, .app-2rEoOp").first().css("overflow", "");
        $(".chat-3bRxxu").first().css("visibility", "").css("min-width", "");
        $(".flex-vertical.channels-wrap").first().css("flex-grow", "");
        $(".guild-header .btn.btn-hamburger").first().css("visibility", "");
    }
};