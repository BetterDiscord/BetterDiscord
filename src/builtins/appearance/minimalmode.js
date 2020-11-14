import Builtin from "../../structs/builtin";

export default new class MinimalMode extends Builtin {
    get name() {return "MinimalMode";}
    get category() {return "appearance";}
    get id() {return "minimalMode";}

    enabled() {
        document.body.classList.add("bd-minimal");
    }

    disabled() {
        document.body.classList.remove("bd-minimal");
    }
};