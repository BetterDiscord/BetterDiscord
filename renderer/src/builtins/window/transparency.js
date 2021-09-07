import Builtin from "../../structs/builtin";
import Modals from "../../ui/modals";
import {Strings, IPC} from "modules";

export default new class WindowTransparency extends Builtin {
    get name() {return "WindowTransparency";}
    get category() {return "window";}
    get id() {return "transparency";}

    enabled() {
        this.showModal(Strings.WindowPrefs.enabledInfo);
        document.body.classList.add("bd-transparency");
    }

    disabled() {
        this.showModal(Strings.WindowPrefs.disabledInfo);
        document.body.classList.remove("bd-transparency");
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