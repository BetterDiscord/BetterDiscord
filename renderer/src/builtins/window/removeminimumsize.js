import Builtin from "../../structs/builtin";
import IPC from "../../modules/ipc";

export default new class RemoveMinimumSize extends Builtin {
    get name() {return "RemoveMinimumSize";}
    get category() {return "window";}
    get id() {return "removeMinimumSize";}

    enabled() {
        IPC.setMinimumSize(1, 1);
    }

    disabled() {
        IPC.setMinimumSize(940, 500);
    }
};