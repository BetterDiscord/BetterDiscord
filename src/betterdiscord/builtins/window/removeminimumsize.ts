import Builtin from "@structs/builtin";

import IPC from "@modules/ipc";
import Modals from "@ui/modals";
import {t} from "@common/i18n";

export default new class RemoveMinimumSize extends Builtin {
    get name() {return "RemoveMinimumSize";}
    get category() {return "window";}
    get id() {return "removeMinimumSize";}

    async enabled() {
        this.showModal();
    }

    async disabled() {
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