import Builtin from "@structs/builtin";

import IPC from "@modules/ipc";

export default new class InspectElement extends Builtin {
    get name() {return "InspectElementHotkey";}
    get category() {return "developer";}
    get id() {return "inspectElement";}

    async enabled() {
        document.addEventListener("keydown", this.inspectElement);
    }

    async disabled() {
        document.removeEventListener("keydown", this.inspectElement);
    }

    inspectElement(e: KeyboardEvent) {
        const metaKey = process.platform === "darwin" ? e.metaKey : e.ctrlKey;
        if (metaKey && e.shiftKey && e.key === "C") { // Ctrl/Cmd + Shift + C
            IPC.inspectElement();
        }
    }
};