import Builtin from "../../structs/builtin";
import {React, WebpackModules} from "modules";
import PluginManager from "../../modules/pluginmanager";
import ThemeManager from "../../modules/thememanager";
import BdWebApi from "../../modules/bdwebapi";
import StoreCard from "../../ui/settings/addonlist/storecard";
// import openStoreDetail from "../../ui/settings/addonlist/storedetail";
import Modals from "../../ui/modals";

import { URL } from "url";

const BD_PROTOCOL = "betterdiscord:";
const BD_PROTOCOL_REGEX = new RegExp(BD_PROTOCOL + "//", "i");

export default new class Store extends Builtin {
    get name() {return "Store";}
    get category() {return "addons";}
    get id() {return "store";}

    enabled() {
        this.patchMarkdownParser();
        this.patchTrustedModule();
        this.patchEmbeds();
    }

    disabled() {
        this.unpatchAll();
    }

    patchEmbeds() {
        const MessageAccessories = WebpackModules.getByProps("MessageAccessories")?.MessageAccessories;
        const PROTOCOL_REGEX = new RegExp("<([^: >]+:/[^ >]+)>", "g");

        if (!MessageAccessories?.prototype.renderEmbeds) return;

        this.instead(MessageAccessories.prototype, "renderEmbeds", (thisObject, methodArguments, renderEmbeds) => {
            const embeds = Reflect.apply(renderEmbeds, thisObject, methodArguments);
            const matchedProtocols = methodArguments[0]?.content.match(PROTOCOL_REGEX)?.map(match => {
                const url = new URL(match.replace(/\s+/g, ' ').replaceAll(/[<>]+/g, "").trim());

                if (url.hostname === "addon" && url.protocol === BD_PROTOCOL) return url;
            }).filter(m => m != null);
            
            if (!matchedProtocols || !matchedProtocols?.length) return embeds;
            
            return (embeds ?? []).concat(matchedProtocols.map(url => (
                React.createElement(EmbeddedStoreCard, { addon: url.pathname.slice(1) }))
            ));
        });
    }

    patchTrustedModule() {
        const TrustedModule = WebpackModules.getByProps("isLinkTrusted", "handleClick");

        if (!TrustedModule) return;

        this.instead(TrustedModule, "handleClick", (thisObject, methodArguments, handleClick) => {
            const [{href, onClick}, event] = methodArguments;

            if (BD_PROTOCOL_REGEX.test(href)) {
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

        if (!SimpleMarkdown?.defaultRules?.link) return;

        this.after(SimpleMarkdown.defaultRules.link, "react", (_, [{target: url}], returnValue) => {
            if (!BD_PROTOCOL_REGEX.test(url)) return;

            return this.renderContent(url, returnValue);
        });
    }

    renderContent(path, link) {
        const url = new URL(path);

        if (url.hostname === "addon") {
            link.props.onClick = async () => {
                const addon = url.pathname.slice(1);
                if (!addon) return;
    
                const data = await BdWebApi.getAddon(addon);
                if (!data?.id) return;
                const manager = data.type === "theme" ? ThemeManager : PluginManager;

                Modals.showInstallationModal({
                    ...data,
                    folder: manager.addonFolder,
                    reload: manager.reloadTheme.bind(manager)
                });
            }
        }

        return link;
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
        BdWebApi.getAddon(this.props.addon).then(data => {
            if (data.id) this.setState({ addon: data });
        });
    }

    isInstalled = (filename) => {
        return this.manager.isLoaded(filename);
    }

    get manager() {
        return this.state.addon?.type === "theme" ? ThemeManager : PluginManager;
    }

    render() {
        const {addon} = this.state;
        const {manager} = this;

        return [
            addon ? React.createElement(StoreCard, {
                ...addon,
                thumbnail: BdWebApi.endpoints.thumbnail(addon.thumbnail_url),
                folder: manager.addonfolder,
                installAddon: BdWebApi.installAddon.bind(BdWebApi),
                reload: addon.type === "theme" ? ThemeManager.reloadTheme.bind(ThemeManager) : PluginManager.reloadPlugin.bind(PluginManager),
                deleteAddon: manager.deleteAddon.bind(manager),
                confirmAddonDelete: manager.confirmAddonDelete.bind(manager),
                isInstalled: this.isInstalled.bind(this),
                className: "bd-store-card-embedded",
                // onDetailsView: () => {
                //     openStoreDetail(addon);
                // }
            }) : null
        ]
    }
}
