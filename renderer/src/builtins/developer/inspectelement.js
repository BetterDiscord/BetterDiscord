import Builtin from "../../structs/builtin";
import IPC from "../../modules/ipc";

export default new class InspectElement extends Builtin {
    get name() {return "InspectElementHotkey";}
    get category() {return "developer";}
    get id() {return "inspectElement";}

    enabled() {
        document.addEventListener("keydown", this.inspectElement);
    }

    disabled() {
        document.removeEventListener("keydown", this.inspectElement);
    }

    inspectElement(e) {
        if (e.ctrlKey && e.shiftKey && e.key === "C") { // Ctrl + Shift + C
            IPC.inspectElement();
        }
    }
};