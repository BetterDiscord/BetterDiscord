import Builtin from "@structs/builtin";

import Strings from "@modules/strings";
import IPC from "@modules/ipc";

import Modals from "@ui/modals";


export default new class NativeFrame extends Builtin {
    get name() {return "NativeFrame";}
    get category() {return "window";}
    get id() {return "frame";}

    enabled() {
        this.showModal(Strings.NativeFrame.enabledInfo);
        document.body.classList.add("bd-frame");
    }

    disabled() {
        this.showModal(Strings.NativeFrame.disabledInfo);
        document.body.classList.remove("bd-frame");
    }

    showModal(info) {
        if (!this.initialized) return;
        Modals.showConfirmationModal(Strings.Modals.additionalInfo, info, {
            confirmText: Strings.Modals.restartNow,
            cancelText: Strings.Modals.restartLater,
            danger: true,
            onConfirm: () => IPC.relaunch()
        });
    }
};