import { Strings } from "modules";
import PluginManager from "./pluginmanager";
import ThemeManager from "./thememanager";
import Notices from "../ui/notices";

const shell = require("electron").shell;

function waitForContainer() {
    // TODO: experiment with waiting for NoticeStore instead
    return new Promise(resolve => {
        const checkForContainer = function () {
            if (document.readyState != "complete") setTimeout(checkForContainer, 100);
            if (document.querySelector(`.${Notices.baseClass}`)) return resolve();
            setTimeout(checkForContainer, 100);
        };
        checkForContainer();
    });
};

export const showRecoveryNotice = async () => {
    await waitForContainer();
    setTimeout(
        () => Notices.show(
            Strings.RecoveryMode.noticeMessage,
            {
                type: "error",
                buttons: [
                    {
                        label: Strings.Addons.openFolder.format({type: Strings.Panels.plugins}),
                        onClick: () => {
                            shell.openPath(PluginManager.addonFolder);
                        }
                    },
                    {
                        label: "Reload",
                        onClick: () => window.location.reload()
                    }
                ],
                timeout: 0
            }
        ), 0
    )
    
}