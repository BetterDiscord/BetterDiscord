import Builtin from "@structs/builtin";

import IPC from "@modules/ipc";
import Modals from "@ui/modals";
import Strings from "@modules/strings";

export default new class RemoveMinimumSize extends Builtin {
    get name() {return "RemoveMinimumSize";}
    get category() {return "window";}
    get id() {return "removeMinimumSize";}

    enabled() {
        this.showModal();
    }

    disabled() {
        this.showModal();
    }

    showModal() {
        if (!this.initialized) return;
        Modals.showConfirmationModal(Strings.Modals.additionalInfo, Strings.Modals.restartPrompt, {
            confirmText: Strings.Modals.restartNow,
            cancelText: Strings.Modals.restartLater,
            danger: true,
            onConfirm: () => IPC.relaunch()
        });
    }
};