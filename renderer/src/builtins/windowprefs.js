import Builtin from "../structs/builtin";
import Modals from "../ui/modals";
import {DataStore, Strings, IPC} from "modules";

export default new class WindowPrefs extends Builtin {
    get name() {return "WindowPrefs";}
    get category() {return "window";}
    get id() {return "transparency";}

    enabled() {
        this.showModal(Strings.WindowPrefs.enabledInfo);
    }

    disabled() {
        this.showModal(Strings.WindowPrefs.disabledInfo);
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