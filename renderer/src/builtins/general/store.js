import Builtin from "../../structs/builtin";
import {React, WebpackModules} from "modules";
import { Config } from "data";
import { fetchAddon } from "../../ui/settings/addonlist/api";
import AddonManager from "../../modules/addonmanager";
import PluginManager from "../../modules/pluginmanager";
import ThemeManager from "../../modules/thememanager";
import StoreCard from "../../ui/settings/addonlist/storecard";
import openStoreDetail from "../../ui/settings/addonlist/storedetail";

import path from "path";

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
            case "addon":
                return React.createElement(React.Fragment, null, [
                    link,
                    React.createElement(EmbeddedStoreCard, { addon: "Slate" }, null)
                ]);
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

class EmbeddedStoreCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            addon: null,
            loading: true
        };
    }

    async componentDidMount() {
        const data = await fetchAddon(this.props.addon);

        this.setState({
            addon: data,
            loading: false
        });
    }

    render() {
        return !this.state.loading ? React.createElement(StoreCard, {
            ...this.state.addon,
            isInstalled: AddonManager.isLoaded,
            folder: this.state.addon.type === "theme" ? ThemeManager.addonFolder : PluginManager.addonFolder,
            onDetailsView: () => {
                openStoreDetail(this.state.addon);
            }
        }) : null;
    }
}