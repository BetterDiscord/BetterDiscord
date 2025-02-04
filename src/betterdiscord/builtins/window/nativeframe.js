import Builtin from "@structs/builtin";

import IPC from "@modules/ipc";
import Modals from "@ui/modals";
import Strings from "@modules/strings";
import Events from "@modules/emitter";

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
        Modals.showConfirmationModal(Strings.Modals.additionalInfo, Strings.Modals.restartPrompt, {
            confirmText: Strings.Modals.restartNow,
            cancelText: Strings.Modals.restartLater,
            danger: true,
            onConfirm: () => IPC.relaunch()
        });
    }
};