import Patcher from "@modules/patcher";
import CustomCSS from "@builtins/customcss";
import React from "@modules/react";
import DOMManager from "@modules/dommanager";
import Settings from "@stores/settings";
import Toasts from "@stores/toasts";
import {t} from "@common/i18n";
import {PackageOpenIcon} from "lucide-react";
import {getModule, getByKeys} from "@webpack";
import Logger from "@common/logger";
import NotificationUI from "@ui/notifications";
import Modals from "@ui/modals.js";
import {findInTree} from "@common/utils";
import type {Rule, SimpleMarkdown} from "discord/modules";


class InstallCSS {
    static activeNotifications = new Map();

    static initialize() {
        const patch = (getModule(m => m.defaultRules && m.parse) as SimpleMarkdown).defaultRules.codeBlock as Required<Rule>;
        const codeBlockStyles: any = getByKeys(["codeActions"]);
        if (!patch.react || typeof patch.react !== "function") return;

        Patcher.after("InstallCSS", patch, "react", (_, [args]: [{content?: string; lang?: string;}, any, any], child) => {
            const isEnabled = Settings.get("customcss", "customcss");
            if (!isEnabled) return;

            const content = args.content;
            if (!content) return;

            if (child?.type !== "pre") return;
            if (args?.lang?.toLowerCase() !== "css") return;

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
                            if (args.content) this.handleCSSInstall(args.content);
                            return;
                        }

                        Modals.showConfirmationModal(
                            t("Modals.confirmAction"),
                            t("Modals.installCss"),
                            {
                                confirmText: t("Modals.okay"),
                                cancelText: t("Modals.cancel"),
                                onConfirm: () => args?.content && this.handleCSSInstall(args.content)
                            }
                        );
                    }}
                />
            ];
        });

        DOMManager.injectStyle("bd-installcss",
        `.${codeBlockStyles.markup} .${codeBlockStyles.codeContainer}:hover .${codeBlockStyles.codeActions} {
                display: flex;
                flex-direction: row-reverse;
                gap: 8px;
            }`
        );
    }

    static handleCSSInstall(cssBlock: string) {
        try {
            const currentCSS = CustomCSS.savedCss || "";
            const newCSS = currentCSS + "\n" + cssBlock;

            CustomCSS.saveCSS(newCSS);
            CustomCSS.insertCSS(newCSS);
            Toasts.show(t("CustomCSS.cssInstallSuccess"), {type: "success"});

            const notificationId = `css-undo-${Date.now()}`;

            this.activeNotifications.set(notificationId, cssBlock);

            NotificationUI.show({
                id: notificationId,
                title: t("CustomCSS.cssInstalled"),
                content: t("CustomCSS.cssReverting"),
                type: "warning",
                duration: 10000,
                actions: [{
                    label: "Keep",
                    onClick: () => this.keepChanges(notificationId)
                }],
                onClose: () => this.revertCSS(notificationId)
            });
        }
        catch (error) {
            Logger.log("InstallCSS", "Failed to install CSS:", error);
            Toasts.show(t("CustomCSS.cssInstallError"), {type: "error"});
        }
    }

    static keepChanges(notificationId: string) {
        this.activeNotifications.delete(notificationId);
        Toasts.show(t("CustomCSS.cssKept"), {type: "success"});
    }

    static revertCSS(notificationId: string) {
        const cssBlock = this.activeNotifications.get(notificationId);
        if (!cssBlock) return;

        const currentCSS = CustomCSS.savedCss || "";
        const newCSS = currentCSS.replace(cssBlock, "");

        CustomCSS.saveCSS(newCSS);
        CustomCSS.insertCSS(newCSS);
        this.activeNotifications.delete(notificationId);
        Toasts.show(t("CustomCSS.cssReverted"), {type: "error"});
    }
}

export default InstallCSS;