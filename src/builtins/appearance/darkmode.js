import Builtin from "../../structs/builtin";

export default new class DarkMode extends Builtin {
    get name() {return "DarkMode";}
    get category() {return "appearance";}
    get id() {return "darkMode";}

    enabled() {
        document.getElementById("app-mount").classList.add("bda-dark", "bd-dark");
    }

    disabled() {
        document.getElementById("app-mount").classList.remove("bda-dark", "bd-dark");
    }
};