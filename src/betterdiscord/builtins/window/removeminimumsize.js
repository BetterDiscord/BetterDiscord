import Builtin from "@structs/builtin";

import {t} from "@common/i18n";
import IPC from "@modules/ipc";
import Modals from "@ui/modals";

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
        Modals.showConfirmationModal(t("Modals.additionalInfo"), t("Modals.restartPrompt"), {
            confirmText: t("Modals.restartNow"),
            cancelText: t("Modals.restartLater"),
            danger: true,
            onConfirm: () => IPC.relaunch()
        });
    }
};
