import Builtin from "@structs/builtin";

import {t} from "@common/i18n";
import Events from "@modules/emitter";
import IPC from "@modules/ipc";
import Modals from "@ui/modals";

export default new class NativeFrame extends Builtin {
    get name() {return "NativeFrame";}
    get category() {return "window";}
    get id() {return "frame";}

    initialize() {
        Events.on("setting-updated", (collection, category, id) => {
            if (collection != this.collection || category !== this.category || id !== "inAppTrafficLights") return;
            this.showModal();
        });

        super.initialize();
    }

    enabled() {
        document.body.classList.add("bd-frame");

        this.showModal();
    }

    disabled() {
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
