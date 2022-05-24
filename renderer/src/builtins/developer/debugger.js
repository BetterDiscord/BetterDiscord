import Builtin from "../../structs/builtin";

export default new class DeveloperMode extends Builtin {
    get name() {return "Debugger";}
    get category() {return "developer";}
    get id() {return "debuggerHotkey";}

    enabled() {
        document.addEventListener("keydown", this.debugListener);
    }

    disabled() {
        document.removeEventListener("keydown", this.debugListener);
    }

    debugListener(e) {
        if (e.which === 119 || e.which == 118) { // F8
            debugger; // eslint-disable-line no-debugger
            e.preventDefault();
            e.stopImmediatePropagation();
         }
    }
};