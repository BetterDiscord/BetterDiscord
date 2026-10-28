import Builtin from "@structs/builtin";

import IPC from "@modules/ipc";
import settings from "@stores/settings";
import type {BrowserWindow} from "electron";
import Modals from "@ui/modals";
import {t} from "@common/i18n";

export default new class ExtraWindowHandlers extends Builtin {
    get name() {return "ExtraWindowHandlers";}
    get category() {return "window";}

    async initialize() {
        const on = <T>(key: string, cb: (value: T) => void) => settings.on<T>(this.collection, this.category, key, cb);

        on<Parameters<BrowserWindow["setVibrancy"]>[0] | "none">("vibrancy", (value) => IPC.setVibrancy(value));
        on<Parameters<BrowserWindow["setBackgroundMaterial"]>[0]>("backgroundMaterial", (value) => IPC.setBackgroundMaterial(value));
        on("visualEffectState", () => this.showModal());
        on("acceptFirstMouse", () => this.showModal());
        on("roundedCorners", () => this.showModal());
    }

    showModal() {
        Modals.showConfirmationModal(t("Modals.additionalInfo"), t("Modals.restartPrompt"), {
            confirmText: t("Modals.restartNow"),
            cancelText: t("Modals.restartLater"),
            danger: true,
            onConfirm: () => IPC.relaunch()
        });
    }
};