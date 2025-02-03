import WebpackModules from "@modules/webpackmodules";
import Patcher from "@modules/patcher";
import Utils from "@modules/api/utils";
import CustomCSS from "@builtins/customcss";
import React from "@modules/react";
import Settings from "@modules/settingsmanager";
import Strings from "@modules/strings";
import Logger from "@common/logger";
import NotificationUI from "@modules/notification";
import UI from "@modules/api/ui";

const Icon = ({onClick}) => (
    <div onClick={onClick} role="button" tabIndex={0}>
        <svg width="16" height="16" viewBox="0 0 24 24" role="img">
            <path
                fill="currentColor"
                d="M12,21.5l-8-4.7v-3.8l-4-2.4l5-4.7l7-3.3l7.2,3.3l4.8,4.7l-4,2.3v3.8L12,21.5z M13,12.2V19l5-3v-2l-2.1,1.2L13,12.2z M6,16l5,3v-6.8l-3.1,3L6,14V16z M13.4,10.5l2.9,2.7l5.2-3.1l-3-2.8L13.4,10.5z M2.6,10.1l5.1,3.1l2.9-2.7L5.5,7.3L2.6,10.1z M7.1,6.5l4.9,3l4.9-3L12,4.1L7.1,6.5z"
            />
        </svg>
    </div>
);

const containsCss = (content) => content?.includes("```css");

class InstallCSS {
    static initialize() {
        const patch = WebpackModules.getBySource(".VOICE_HANGOUT_INVITE?\"\":");
        Patcher.after("InstallCSS", patch?.ZP, "type", (_, [args], res) => {
            const isEnabled = Settings.get("customcss", "customcss");
            if (!isEnabled) return;

            const content = args?.message?.content;
            if (!content || !containsCss(content)) return;

            const codeActions = Utils.findInTree(res, x => x?.className?.includes("codeActions"), {walkable: ["props", "children"]});
            if (!codeActions) return;

            const currentText = Utils.findInTree(res, x => x?.text, {walkable: ["props", "children"]})?.text;
            if (!currentText) return;

            codeActions.children = [
                codeActions.children,
                <Icon key="install-css" onClick={(event) => {
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
                onDurationDone: () => this.revertCSS()
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