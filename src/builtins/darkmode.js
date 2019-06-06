import Builtin from "../structs/builtin";

export default new class DarkMode extends Builtin {
    get name() {return "DarkMode";}
    get category() {return "appearance";}
    get id() {return "darkMode";}

    enabled() {
        $("#app-mount").addClass("bda-dark").addClass("bd-dark");
    }

    disabled() {
        $("#app-mount").removeClass("bda-dark").removeClass("bd-dark");
    }
};