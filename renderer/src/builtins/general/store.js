import Builtin from "../../structs/builtin";
import {React, WebpackModules} from "modules";
import { fetchAddon } from "../../ui/settings/addonlist/api";
import PluginManager from "../../modules/pluginmanager";
import ThemeManager from "../../modules/thememanager";
import StoreCard from "../../ui/settings/addonlist/storecard";
import openStoreDetail from "../../ui/settings/addonlist/storedetail";
import Modals from "../../ui/modals";

import { URL } from "url";

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

            return this.renderContent(url, returnValue);
        });
    }

    renderContent(path, link) {
        const url = new URL(path);

        switch (url.hostname) {
            case "addon":
                const addon = url.pathname.slice(1);

                if (!addon) return link;

                return React.createElement(EmbeddedStoreCard, { addon, link }, null)
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
            addon: null
        };
    }

    componentDidMount() {
        fetchAddon(this.props.addon).then(data => {
            this.setState({
                addon: data
            });
        });
    }

    componentDidUpdate() {
        if (this.state.addon) {
            this.props.link.props.onClick = () => {
                Modals.showInstallationModal({ ...this.state.addon, folder: this.folder });
            }
        }
    }

    get folder() {
        return this.state.addon.type === "theme" ? ThemeManager.addonFolder : PluginManager.addonFolder;
    }

    isInstalled = (name) => {
        return this.state.addon.type === "theme" ? ThemeManager.isLoaded(name) : PluginManager.isLoaded(name);
    }

    render() {
        return [
            this.props.link,
            this.state.addon ? React.createElement(StoreCard, {
                ...this.state.addon,
                folder: this.folder,
                isInstalled: this.isInstalled,
                className: "bd-store-card-embedded",
                onDetailsView: () => {
                    openStoreDetail(this.state.addon);
                }
            }) : null
        ]
    }
}