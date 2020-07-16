import Builtin from "../structs/builtin";
import Modals from "../ui/modals";
import {DataStore, Strings} from "modules";

export default new class WindowPrefs extends Builtin {
    get name() {return "WindowPrefs";}
    get category() {return "window";}
    get id() {return "transparency";}

    enabled() {
        this.setWindowPreference("transparent", true);
        this.setWindowPreference("backgroundColor", "#00000000");
        this.showModal(Strings.WindowPrefs.enabledInfo);
    }

    disabled() {
        this.deleteWindowPreference("transparent");
        this.deleteWindowPreference("backgroundColor");
        this.showModal(Strings.WindowPrefs.disabledInfo);
    }

    showModal(info) {
        if (!this.initialized) return;
        Modals.showConfirmationModal(Strings.Modals.additionalInfo, info, {
            confirmText: Strings.Modals.restartNow,
            cancelText: Strings.Modals.restartLater,
            onConfirm: () => {
                const app = require("electron").remote.app;
                app.relaunch();
                app.exit();
            }
        });
    }

    getWindowPreference(key) {
        const prefs = DataStore.getData("windowprefs") || {};
        return prefs[key];
    }

    setWindowPreference(key, value) {
        const prefs = DataStore.getData("windowprefs") || {};
        prefs[key] = value;
        DataStore.setData("windowprefs", prefs);
    }

    deleteWindowPreference(key) {
        const prefs = DataStore.getData("windowprefs") || {};
        delete prefs[key];
        DataStore.setData("windowprefs", prefs);
    }
};