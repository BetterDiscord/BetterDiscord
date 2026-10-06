import Builtin from "@structs/builtin";

import IPC from "@modules/ipc";

export default new class RemoveMinimumSize extends Builtin {
    get name() {return "RemoveMinimumSize";}
    get category() {return "window";}
    get id() {return "removeMinimumSize";}

    async enabled() {
        IPC.setMinimumSize(0, 0);
    }

    async disabled() {
        IPC.setMinimumSize(800, 500);
    }
};