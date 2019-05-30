import {SettingsInfo} from "data";
import WebpackModules, {DiscordModules} from "./webpackmodules";
import BdApi from "./pluginapi";
import BDLogo from "../ui/icons/bdlogo";

export default new class V2 {

    constructor() {
        this.editorDetached = false;
    }

    initialize() {
        BdApi.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
        BdApi.suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
        BdApi.suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
        BdApi.suppressErrors(this.patchGuildSeparator.bind(this), "BD Guild Separator Patch")();
    }

    get messageClasses() {return WebpackModules.getByProps("message", "containerCozy");}
    get guildClasses() {
		const guildsWrapper = WebpackModules.getByProps("wrapper", "unreadMentionsBar");
        const guilds = WebpackModules.getByProps("guildsError", "selected");
        const pill = WebpackModules.getByProps("blobContainer");
        return Object.assign({}, guildsWrapper, guilds, pill);
	}

    get MessageContentComponent() {return WebpackModules.getModule(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));}
    get TimeFormatter() {return WebpackModules.getByProps("dateFormat");}
    get TooltipWrapper() {return WebpackModules.getByDisplayName("TooltipDeprecated");}
    get NativeModule() {return WebpackModules.getByProps("setBadge");}
    get Tooltips() {return WebpackModules.getModule(m => m.hide && m.show && !m.search && !m.submit && !m.search && !m.activateRagingDemon && !m.dismiss);}
    get KeyGenerator() {return WebpackModules.getModule(m => m.toString && /"binary"/.test(m.toString()));}

    patchSocial() {
        if (this.socialPatch) return;
        const TabBar = BdApi.findModule(m => m.displayName == "TabBar");
        const Anchor = BdApi.findModule(m => m.displayName == "Anchor");
        if (!TabBar || !Anchor) return;
        this.socialPatch = BdApi.monkeyPatch(TabBar.prototype, "render", {after: (data) => {
            const children = data.returnValue.props.children;
            if (!children || !children.length) return;
            if (children[children.length - 2].type.displayName !== "Separator") return;
            if (!children[children.length - 1].type.toString().includes("socialLinks")) return;
            const original = children[children.length - 1].type;
            const newOne = function() {
                const returnVal = original(...arguments);
                returnVal.props.children.push(BdApi.React.createElement(Anchor, {className: "bd-social-link", href: "https://github.com/rauenzi/BetterDiscordApp", rel: "author", title: "BandagedBD", target: "_blank"},
                    BdApi.React.createElement(BDLogo, {size: "16px", className: "bd-social-logo"})
                ));
                return returnVal;
            };
            children[children.length - 1].type = newOne;
        }});
    }

    patchGuildListItems() {
        if (this.guildListItemsPatch) return;
        const listItemClass = this.guildClasses.listItem.split(" ")[0];
        const blobClass = this.guildClasses.blobContainer.split(" ")[0];
        const reactInstance = BdApi.getInternalInstance(document.querySelector(`.${listItemClass} .${blobClass}`).parentElement);
        const GuildComponent = reactInstance.return.type;
        if (!GuildComponent) return;
        this.guildListItemsPatch = BdApi.monkeyPatch(GuildComponent.prototype, "render", {after: (data) => {
            const returnValue = data.returnValue;
            const guildData = data.thisObject.props;
            returnValue.props.className += " bd-guild";
            if (guildData.unread) returnValue.props.className += " bd-unread";
            if (guildData.selected) returnValue.props.className += " bd-selected";
            if (guildData.audio) returnValue.props.className += " bd-audio";
            if (guildData.video) returnValue.props.className += " bd-video";
            if (guildData.badge) returnValue.props.className += " bd-badge";
            if (guildData.animatable) returnValue.props.className += " bd-animatable";
            return returnValue;
        }});
    }

    patchGuildPills() {
        if (this.guildPillPatch) return;
        const guildPill = BdApi.findModule(m => m.default && m.default.toString && m.default.toString().includes("translate3d"));
        if (!guildPill) return;
        this.guildPillPatch = BdApi.monkeyPatch(guildPill, "default", {after: (data) => {
            const props = data.methodArguments[0];
            if (props.unread) data.returnValue.props.className += " bd-unread";
            if (props.selected) data.returnValue.props.className += " bd-selected";
            if (props.hovered) data.returnValue.props.className += " bd-hovered";
            return data.returnValue;
        }});
    }

    patchGuildSeparator() {
        if (this.guildSeparatorPatch) return;
        const Guilds = BdApi.findModuleByDisplayName("Guilds");
        const guildComponents = BdApi.findModuleByProps("renderListItem");
        if (!guildComponents || !Guilds) return;
        const GuildSeparator = function() {
            const returnValue = guildComponents.Separator(...arguments);
            returnValue.props.className += " bd-guild-separator";
            return returnValue;
        };
        this.guildSeparatorPatch = BdApi.monkeyPatch(Guilds.prototype, "render", {after: (data) => {
            data.returnValue.props.children[1].props.children[3].type = GuildSeparator;
        }});
    }

};