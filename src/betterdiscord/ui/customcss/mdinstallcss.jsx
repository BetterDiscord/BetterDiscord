import Patcher from "@modules/patcher";
import CustomCSS from "@builtins/customcss";
import React from "@modules/react";
import Settings from "@stores/settings";
import Strings from "@modules/strings";
import {PackageOpenIcon} from "lucide-react";
import {getModule} from "@webpack";
import Logger from "@common/logger";
import NotificationUI from "@modules/notification";
import Toasts from "@ui/toasts.js";
import Modals from "@ui/modals.js";
import {findInTree} from "@common/utils";

class InstallCSS {
    static activeNotifications = new Map();

    static initialize() {
        const patch = getModule(m => m.defaultRules && m.parse).defaultRules.codeBlock;
        Patcher.after("InstallCSS", patch, "react", (_, [args], child) => {
            const isEnabled = Settings.get("customcss", "customcss");
            if (!isEnabled) return;

            const content = args.content;
            if (!content) return;

            if (child?.type !== "pre") return;
            if (args?.lang.toLowerCase() !== "css") return;

            const codeActions = findInTree(child, x => x?.className?.includes("codeActions"), {walkable: ["props", "children"]});
            if (!codeActions) return;

            if (!args?.content) return;

            const existingCodeblocks = Array.isArray(codeActions.children) ? codeActions.children : [codeActions.children];
            codeActions.children = [
                ...existingCodeblocks,
                <PackageOpenIcon
                    style={{cursor: "pointer"}}
                    size="16px"
                    key="icon"
                    onClick={async (event) => {
                        if (event.shiftKey) {
                            this.handleCSSInstall(args?.content);
                            return;
                        }

                        Modals.showConfirmationModal(
                            Strings.Modals.confirmAction,
                            Strings.Modals.installCss,
                            {
                                confirmText: Strings.Modals.okay,
                                cancelText: Strings.Modals.cancel,
                                onConfirm: () => this.handleCSSInstall(args?.content)
                            }
                        );
                    }}
                />
            ];
        });
    }

    static handleCSSInstall(cssBlock) {
        try {
            const currentCSS = CustomCSS.savedCss || "";
            const newCSS = currentCSS + "\n" + cssBlock;

            CustomCSS.saveCSS(newCSS);
            CustomCSS.insertCSS(newCSS);
            Toasts.show(Strings.CustomCSS.cssInstallSuccess, {type: "success"});

            const notificationId = `css-undo-${Date.now()}`;

            this.activeNotifications.set(notificationId, cssBlock);

            NotificationUI.show({
                id: notificationId,
                title: Strings.CustomCSS.cssInstalled,
                content: Strings.CustomCSS.cssReverting,
                type: "warning",
                duration: 10000,
                actions: [{
                    label: "Keep",
                    onClick: () => this.keepChanges(notificationId)
                }],
                onDurationDone: () => this.revertCSS(notificationId)
            });
        }
        catch (error) {
            Logger.log("InstallCSS", "Failed to install CSS:", error);
            Toasts.show(Strings.CustomCSS.cssInstallError, {type: "error"});
        }
    }

    static keepChanges(notificationId) {
        this.activeNotifications.delete(notificationId);
        Toasts.show(Strings.CustomCSS.cssKept, {type: "success"});
    }

    static revertCSS(notificationId) {
        const cssBlock = this.activeNotifications.get(notificationId);
        if (!cssBlock) return;

        const currentCSS = CustomCSS.savedCss || "";
        const newCSS = currentCSS.replace(cssBlock, "");

        CustomCSS.saveCSS(newCSS);
        CustomCSS.insertCSS(newCSS);
        this.activeNotifications.delete(notificationId);
        Toasts.show(Strings.CustomCSS.cssReverted, {type: "error"});
    }
}

export default InstallCSS;