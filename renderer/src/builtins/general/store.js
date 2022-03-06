import Builtin from "../../structs/builtin";
import {React, WebpackModules} from "modules";
import PluginManager from "../../modules/pluginmanager";
import ThemeManager from "../../modules/thememanager";

const {shell} = require("electron");

const protocol = "betterdiscord://";
const protocolRegex = new RegExp(protocol, "i");

export default new class Store extends Builtin {
    get name() {return "Store";}
    get category() {return "general";}
    get id() {return "store";}

    enabled() {
        this.patchMarkdownParser();
        this.patchTrustedModule();
    }

    patchTrustedModule() {
        const TrustedModule = WebpackModules.getByProps("isLinkTrusted", "handleClick");

        if (!TrustedModule) return;

        this.instead(TrustedModule, "handleClick", (thisObject, methodArguments, handleClick) => {
            const [{href, onClick}, event] = methodArguments;

            if (protocolRegex.test(href)) {
                if (typeof onClick === "function") onClick(event);

                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                return true;
            }

            return Reflect.apply(handleClick, thisObject, methodArguments);
        });
    }

    patchMarkdownParser() {
        const SimpleMarkdown = WebpackModules.getByProps("parseTopic", "defaultRules");

        if (!SimpleMarkdown || !SimpleMarkdown.defaultRules.link) return;

        this.after(SimpleMarkdown.defaultRules.link, "react", (_, [{target: url}], returnValue) => {
            if (!protocolRegex.test(url)) return;

            return this.renderContent(url.slice(protocol.length), returnValue);
        });
    }

    renderContent(path, link) {
        switch (path) {
            case "themesfolder":
            case "pluginsfolder":
                link.props.onClick = () => {
                    this.openAddonFolder(path.replace("folder", ""));
                };
                
                return link;
            
            default: return link;
        }
    }

    openAddonFolder(type) {
        switch (type) {
            case "themes":
                shell.openPath(ThemeManager.addonFolder);
                break;
            case "plugins":
                shell.openPath(PluginManager.addonFolder);
                break;
        }
    }

    disabled() {
        this.unpatchAll();
    }
};