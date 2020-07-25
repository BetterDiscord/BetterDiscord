import {Config} from "data";
import WebpackModules from "./webpackmodules";
import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Patcher from "./patcher";
import BDLogo from "../ui/icons/bdlogo";

const React = DiscordModules.React;
const Tooltip = WebpackModules.getByDisplayName("Tooltip");

export default new class ComponentPatcher {

    initialize() {
        Utilities.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
        Utilities.suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
        Utilities.suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
        Utilities.suppressErrors(this.patchGuildSeparator.bind(this), "BD Guild Separator Patch")();
        Utilities.suppressErrors(this.patchMessageHeader.bind(this), "BD Message Header Patch")();
        Utilities.suppressErrors(this.patchMemberList.bind(this), "BD Member List Patch")();
    }

    patchSocial() {
        if (this.socialPatch) return;
        const TabBar = WebpackModules.getByDisplayName("TabBar");
        const Anchor = WebpackModules.getByDisplayName("Anchor");
        if (!TabBar) return;
        this.socialPatch = Patcher.after("ComponentPatcher", TabBar.prototype, "render", (thisObject, args, returnValue) => {
            const children = returnValue.props.children;
            if (!children || !children.length || children.length < 3) return;
            if (children[children.length - 3].type.displayName !== "Separator") return;
            if (!children[children.length - 2].type.toString().includes("socialLinks")) return;
            if (Anchor) {
                const original = children[children.length - 2].type;
                const newOne = function() {
                    const returnVal = original(...arguments);
                    returnVal.props.children.push(
                        DiscordModules.React.createElement(Anchor, {className: "bd-social-link", href: "https://twitter.com/BandagedBD", title: "BandagedBD", target: "_blank"},
                            DiscordModules.React.createElement(BDLogo, {size: "16px", className: "bd-social-logo"})
                        )
                    );
                    return returnVal;
                };
                children[children.length - 2].type = newOne;
            }

            const injector = DiscordModules.React.createElement("div", {className: "colorMuted-HdFt4q size12-3cLvbJ"}, `Injector ${Config.version}`);
            const versionHash = `(${Config.hash ? Config.hash.substring(0, 7) : Config.branch})`;
            const additional = DiscordModules.React.createElement("div", {className: "colorMuted-HdFt4q size12-3cLvbJ"}, `BBD ${Config.bbdVersion} `, DiscordModules.React.createElement("span", {className: "versionHash-2gXjIB da-versionHash"}, versionHash));
            

            const originalVersions = children[children.length - 1].type;
            children[children.length - 1].type = function() {
                const returnVal = originalVersions(...arguments);
                returnVal.props.children.splice(returnVal.props.children.length - 1, 0, injector);
                returnVal.props.children.splice(1, 0, additional);
                return returnVal;
            };
        });
    }

    patchGuildListItems() {
        if (this.guildListItemsPatch) return;
        const listItemClass = DiscordModules.GuildClasses.listItem.split(" ")[0];
        const blobClass = DiscordModules.GuildClasses.blobContainer.split(" ")[0];
        const reactInstance = Utilities.getReactInstance(document.querySelector(`.${listItemClass} .${blobClass}`).parentElement);
        const GuildComponent = reactInstance.return.type;
        if (!GuildComponent) return;
        this.guildListItemsPatch = Patcher.after("ComponentPatcher", GuildComponent.prototype, "render", (thisObject, _, returnValue) => {
            if (!returnValue || !thisObject) return;
            const guildData = thisObject.props;
            returnValue.props.className += " bd-guild";
            if (guildData.unread) returnValue.props.className += " bd-unread";
            if (guildData.selected) returnValue.props.className += " bd-selected";
            if (guildData.audio) returnValue.props.className += " bd-audio";
            if (guildData.video) returnValue.props.className += " bd-video";
            if (guildData.badge) returnValue.props.className += " bd-badge";
            if (guildData.animatable) returnValue.props.className += " bd-animatable";
            return returnValue;
        });
    }

    patchGuildPills() {
        if (this.guildPillPatch) return;
        const guildPill = WebpackModules.getModule(m => m.default && !m.default.displayName && m.default.toString && m.default.toString().includes("translate3d"));
        if (!guildPill) return;
        this.guildPillPatch = Patcher.after("ComponentPatcher", guildPill, "default", (_, args, returnValue) => {
            const props = args[0];
            if (props.unread) returnValue.props.className += " bd-unread";
            if (props.selected) returnValue.props.className += " bd-selected";
            if (props.hovered) returnValue.props.className += " bd-hovered";
            return returnValue;
        });
    }

    patchGuildSeparator() {
        if (this.guildSeparatorPatch) return;
        const Guilds = WebpackModules.getByDisplayName("Guilds");
        const guildComponents = WebpackModules.getByProps("renderListItem");
        if (!guildComponents || !Guilds) return;
        const GuildSeparator = function() {
            const returnValue = guildComponents.Separator(...arguments); // eslint-disable-line new-cap
            returnValue.props.className += " bd-guild-separator";
            return returnValue;
        };
        this.guildSeparatorPatch = Patcher.after("ComponentPatcher", Guilds.prototype, "render", (_, __, returnValue) => {
            const Separator = Utilities.findInReactTree(returnValue, m => m.type && !m.type.displayName && typeof(m.type) == "function" && Utilities.isEmpty(m.props));
            if (!Separator) return;
            Separator.type = GuildSeparator;
        });
    }

    patchMessageHeader() {
        if (this.messageHeaderPatch) return;
        const MessageHeader = WebpackModules.getByProps("MessageTimestamp");
        const Anchor = WebpackModules.find(m => m.displayName == "Anchor");
        if (!Anchor || !MessageHeader || !MessageHeader.default) return;
        this.messageHeaderPatch = Patcher.after("ComponentPatcher", MessageHeader, "default", (_, args, returnValue) => {
            const author = Utilities.getNestedProp(args[0], "message.author");
            const children = Utilities.getNestedProp(returnValue, "props.children.1.props.children.1.props.children");
            if (!children || !author || !author.id || author.id !== "249746236008169473") return;
            if (!Array.isArray(children)) return;
            children.push(
                React.createElement(Tooltip, {color: "black", position: "top", text: "BandagedBD Developer"},
                    props => React.createElement(Anchor, Object.assign({className: "bd-chat-badge", href: "https://github.com/rauenzi/BetterDiscordApp", title: "BandagedBD", target: "_blank"}, props),
                        React.createElement(BDLogo, {size: "16px", className: "bd-logo"})
                    )
                )
            );
        });
    }

    patchMemberList() {
        if (this.memberListPatch) return;
        const MemberListItem = WebpackModules.findByDisplayName("MemberListItem");
        const Anchor = WebpackModules.find(m => m.displayName == "Anchor");
        if (!Anchor || !MemberListItem || !MemberListItem.prototype || !MemberListItem.prototype.renderDecorators) return;
        this.memberListPatch = Patcher.after("ComponentPatcher", MemberListItem.prototype, "renderDecorators", (thisObject, args, returnValue) => {
            const user = Utilities.getNestedProp(thisObject, "props.user");
            const children = Utilities.getNestedProp(returnValue, "props.children");
            if (!children || !user || !user.id || user.id !== "249746236008169473") return;
            if (!Array.isArray(children)) return;
            children.push(
                React.createElement(Tooltip, {color: "black", position: "top", text: "BandagedBD Developer"},
                    props => React.createElement(Anchor, Object.assign({className: "bd-member-badge", href: "https://github.com/rauenzi/BetterDiscordApp", title: "BandagedBD", target: "_blank"}, props),
                        React.createElement(BDLogo, {size: "16px", className: "bd-logo"})
                    )
                )
            );
        });
    }

};