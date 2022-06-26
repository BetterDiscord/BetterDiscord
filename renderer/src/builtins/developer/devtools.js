import Builtin from "../../structs/builtin";
import IPC from "../../modules/ipc";

export default new class DevToolsListener extends Builtin {
    get name() {return "DevTools";}
    get category() {return "developer";}
    get id() {return "devTools";}

    initialize() {
        super.initialize(...arguments);
        this.toggleDevTools = this.toggleDevTools.bind(this);
        document.addEventListener("keydown", this.toggleDevTools);
    }

    toggleDevTools(e) {
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
            e.stopPropagation();
            e.preventDefault();
            if (this.get(this.collection, this.category, this.id)) IPC.toggleDevTools();
        }
    }
};