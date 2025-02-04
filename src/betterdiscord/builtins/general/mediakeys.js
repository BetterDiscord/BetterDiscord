import Builtin from "@structs/builtin";

import Strings from "@modules/strings";
import IPC from "@modules/ipc";

import Modals from "@ui/modals";


export default new class MediaKeys extends Builtin {
    get name() {return "DisableMediaKeys";}
    get category() {return "general";}
    get id() {return "mediaKeys";}

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