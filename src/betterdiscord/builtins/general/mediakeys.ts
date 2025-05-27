import Builtin from "@structs/builtin";

import {t} from "@common/i18n";
import IPC from "@modules/ipc";

import Modals from "@ui/modals";


export default new class MediaKeys extends Builtin {
    get name() {return "DisableMediaKeys";}
    get category() {return "general";}
    get id() {return "mediaKeys";}

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