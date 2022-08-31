import {React, WebpackModules, WebAPI, Strings} from "modules";
import {Web} from "data";

import Builtin from "../../structs/builtin";
import PluginManager from "../../modules/pluginmanager";
import ThemeManager from "../../modules/thememanager";
import StoreCard from "../../ui/settings/addonlist/storecard";
import Modals from "../../ui/modals";
import Toasts from "../../ui/toasts";

import {URL} from "url";

const PROTOCOL_REGEX = new RegExp("<([^: >]+:/[^ >]+)>", "g");
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

        if (!MessageAccessories?.prototype.renderEmbeds) return;

        this.instead(MessageAccessories.prototype, "renderEmbeds", (thisObject, methodArguments, renderEmbeds) => {
            const embeds = Reflect.apply(renderEmbeds, thisObject, methodArguments);
            const matchedProtocols = methodArguments[0]?.content.match(PROTOCOL_REGEX)?.map(match => {
                const url = new URL(match.replace(/\s+/g, " ").replaceAll(/[<>]+/g, "").trim());

                if (url.hostname === "addon" && url.protocol === BD_PROTOCOL) return url;
            }).filter(m => m != null);
            
            if (!matchedProtocols || !matchedProtocols?.length) return embeds;
            
            return (embeds ?? []).concat(matchedProtocols.map((url) => {
                const parameter = url.pathname.slice(1);
                const addonId = Number.isNaN(Number(parameter)) ? parameter : Number(parameter);
                if (!addonId) return null;

                return React.createElement(EmbeddedStoreCard, {addonId});
            }));
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
            const parameter = url.pathname.slice(1);
            const addonId = Number.isNaN(Number(parameter)) ? parameter : Number(parameter);
            if (!addonId) return link;

            link.props.onClick = async (event) => {
                const addon = await WebAPI.getAddon(addonId);

                if (addon?.type) {
                    event.preventDefault();
                    window.open((Web.PAGES[addon.type] + (typeof(addonId) === "number" ? "?id=" : "/") + addonId), "_blank");
                }
            };
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
        WebAPI.getAddon(this.props.addonId).then(data => {
            if (data?.id) this.setState({addon: data});
        });
    }
    
    get manager() {
        return this.state.addon?.type === "theme" ? ThemeManager : PluginManager;
    }

    async install(id, filename) {
        await WebAPI.getAddonContents(id).then(contents => {
            return this.manager.installAddon(contents, filename);
        }).catch(err => {
            Toasts.error(Strings.Store.downloadError.format({type: this.state.addon.type}), err);
        });
    }

    render() {
        const {addon} = this.state;

        return addon ? React.createElement(StoreCard, {
            ...addon,
            key: addon.id,
            className: "bd-store-card-embedded",
            thumbnail: Web.ENDPOINTS.thumbnail(addon.thumbnail_url),
            filename: addon.file_name,
            releaseDate: new Date(addon.release_date),
            isInstalled: this.manager.isLoaded(addon.file_name),
            onInstall: () => Modals.showInstallationModal({
                ...addon,
                thumbnail: Web.ENDPOINTS.thumbnail(addon.thumbnail_url),
                filename: addon.file_name,
                releaseDate: new Date(addon.release_date),
                onInstall: () => this.install(addon.id, addon.file_name)
            }),
            onForceInstall: () => this.install(addon.id, addon.file_name),
            onDelete: () => this.manager.confirmAddonDelete(addon.file_name),
            onForceDelete: () => this.manager.deleteAddon(addon.file_name)
        }) : null;
    }
}
