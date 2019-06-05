import Builtin from "../structs/builtin";

export default new class DarkMode extends Builtin {
    get name() {return "DarkMode";}
    get group() {return "appearance";}
    get id() {return "bda-gs-5";}

    enabled() {
        $("#app-mount").addClass("bda-dark").addClass("bd-dark");
    }

    disabled() {
        $("#app-mount").removeClass("bda-dark").removeClass("bd-dark");
    }
};