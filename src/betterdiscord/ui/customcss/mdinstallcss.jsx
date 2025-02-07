import Patcher from "@modules/patcher";
import Utils from "@api/utils";
import CustomCSS from "@builtins/customcss";
import React from "@modules/react";
import UI from "@api/ui";
import Settings from "@modules/settingsmanager";
import Strings from "@modules/strings";
import {PackageOpenIcon} from "lucide-react";
import {getBySource} from "@webpack";


class InstallCSS {
    static initialize() {
        const patch = getBySource([".VOICE_HANGOUT_INVITE?\"\":"], {searchDefault: false});

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
                <PackageOpenIcon size="16px" key="icon" onClick={async () => {
                    if (!currentText) return;

                    const savedCss = CustomCSS.savedCss || "";
                    const newCSS = savedCss + "\n" + currentText;

                    CustomCSS.saveCSS(newCSS);
                    CustomCSS.insertCSS(newCSS);
                    UI.showToast(Strings.CustomCSS.cssInstallSuccess, {type: "success"});
                }}/>
            ];
        });
    }
}

export default InstallCSS;