import WebpackModules from "@modules/webpackmodules";
import Patcher from "@modules/patcher";
import Utils from "@api/utils";
import CustomCSS from "@builtins/customcss";
import React from "@modules/react";
import UI from "@api/ui";
import Settings from "@modules/settingsmanager";
import Strings from "@modules/strings";
import {PackageOpenIcon} from "lucide-react";
import Logger from "@api/logger.js";
import NotificationUI from "@modules/notification.jsx";


class InstallCSS {
    static initialize() {
        const patch = WebpackModules.getBySource(".VOICE_HANGOUT_INVITE?\"\":");
        Patcher.after("InstallCSS", patch?.ZP, "type", (_, [args], res) => {
            const isEnabled = Settings.get("customcss", "customcss");
            if (!isEnabled) return;

            const content = args.message.content;
            if (!content) return;

            const codeActions = Utils.findInTree(res, x => x?.className?.includes("codeActions"), {walkable: ["props", "children"]});
            if (!codeActions) return;
            const currentText = Utils.findInTree(res, x => x?.text, {walkable: ["props", "children"]})?.text;
            codeActions.children = [
                codeActions.children,
                <PackageOpenIcon size="16px" key="icon" onClick={async (event) => {
                    if (event.shiftKey) {
                        this.handleCSSInstall(currentText);
                        return;
                    }

                    UI.showConfirmationModal(
                        Strings.Modals.confirmAction,
                        Strings.Modals.installCss,
                        {
                            confirmText: Strings.Modals.okay,
                            cancelText: Strings.Modals.cancel,
                            onConfirm: () => this.handleCSSInstall(currentText)
                        }
                    );
                }}/>
            ];
        });
    }

    static handleCSSInstall(currentText) {
        try {
            const oldCSS = CustomCSS.savedCss || "";
            const newCSS = oldCSS + "\n" + currentText;

            CustomCSS.saveCSS(newCSS);
            CustomCSS.insertCSS(newCSS);
            UI.showToast(Strings.CustomCSS.cssInstallSuccess, {type: "success"});

            const notificationId = `css-undo-${Date.now()}`;

            NotificationUI.show({
                id: notificationId,
                title: Strings.CustomCSS.cssInstalled,
                content: Strings.CustomCSS.cssReverting,
                type: "info",
                duration: 10000,
                actions: [{
                    label: "Keep",
                    onClick: () => this.keepChanges(oldCSS, notificationId)
                }],
                onDurationDone: () => this.revertCSS(oldCSS)
            });

        }
        catch (error) {
            Logger.log("InstallCSS", "Failed to install CSS:", error);
            UI.showToast(Strings.CustomCSS.cssInstallError, {type: "error"});
        }
    }

    static keepChanges() {
        UI.showToast(Strings.CustomCSS.cssKept, {type: "success"});
    }

    static revertCSS(oldCSS) {
        CustomCSS.saveCSS(oldCSS);
        CustomCSS.insertCSS(oldCSS);
        UI.showToast(Strings.CustomCSS.cssReverted, {type: "error"});
    }

}

export default InstallCSS;