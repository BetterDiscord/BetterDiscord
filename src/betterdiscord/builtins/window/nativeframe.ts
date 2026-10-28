import Builtin from "@structs/builtin";

import IPC from "@modules/ipc";
import Modals from "@ui/modals";
import {t} from "@common/i18n";

export default new class NativeFrame extends Builtin {
    get name() {return "NativeFrame";}
    get category() {return "window";}
    get id() {return "frame";}

    async enabled() {
        document.body.classList.add("bd-frame");

        this.showModal();
    }

    async disabled() {
        document.body.classList.remove("bd-frame");

        this.showModal();
    }

    showModal() {
        if (!this.initialized) return;
        Modals.showConfirmationModal(t("Modals.additionalInfo"), t("Modals.restartPrompt"), {
            confirmText: t("Modals.restartNow"),
            cancelText: t("Modals.restartLater"),
            danger: true,
            onConfirm: () => IPC.relaunch()
        });
    }
};