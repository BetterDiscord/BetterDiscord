import Builtin from "@structs/builtin";

import {t} from "@common/i18n";
import IPC from "@modules/ipc";

import Modals from "@ui/modals";


export default new class WindowTransparency extends Builtin {
    get name() {return "WindowTransparency";}
    get category() {return "window";}
    get id() {return "transparency";}

    async enabled() {
        this.showModal(t("WindowPrefs.enabledInfo"));
        document.body.classList.add("bd-transparency");
    }

    async disabled() {
        this.showModal(t("WindowPrefs.disabledInfo"));
        document.body.classList.remove("bd-transparency");
    }

    showModal(info: string) {
        if (!this.initialized) return;
        Modals.showConfirmationModal(t("Modals.additionalInfo"), info, {
            confirmText: t("Modals.restartNow"),
            cancelText: t("Modals.restartLater"),
            danger: true,
            onConfirm: () => IPC.relaunch()
        });
    }
};