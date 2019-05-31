import {SettingsInfo} from "data";
import WebpackModules, {DiscordModules} from "./webpackmodules";
import Utilities from "./utilities";
import BDLogo from "../ui/icons/bdlogo";

const React = DiscordModules.React;

export default new class {

    initialize() {
        Utilities.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
        Utilities.suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
        Utilities.suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
        Utilities.suppressErrors(this.patchGuildSeparator.bind(this), "BD Guild Separator Patch")();
    }

    patchSocial() {
        if (this.socialPatch) return;
        const TabBar = WebpackModules.getModule(m => m.displayName == "TabBar");
        const Anchor = WebpackModules.getModule(m => m.displayName == "Anchor");
        if (!TabBar || !Anchor) return;
        this.socialPatch = Utilities.monkeyPatch(TabBar.prototype, "render", {after: (data) => {
            const children = data.returnValue.props.children;
            if (!children || !children.length) return;
            if (children[children.length - 2].type.displayName !== "Separator") return;
            if (!children[children.length - 1].type.toString().includes("socialLinks")) return;
            const original = children[children.length - 1].type;
            const newOne = function() {
                const returnVal = original(...arguments);
                returnVal.props.children.push(React.createElement(Anchor, {className: "bd-social-link", href: "https://github.com/rauenzi/BetterDiscordApp", rel: "author", title: "BandagedBD", target: "_blank"},
                    React.createElement(BDLogo, {size: "16px", className: "bd-social-logo"})
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
        const reactInstance = Utilities.getInternalInstance(document.querySelector(`.${listItemClass} .${blobClass}`).parentElement);
        const GuildComponent = reactInstance.return.type;
        if (!GuildComponent) return;
        this.guildListItemsPatch = Utilities.monkeyPatch(GuildComponent.prototype, "render", {after: (data) => {
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
        const guildPill = WebpackModules.getModule(m => m.default && m.default.toString && m.default.toString().includes("translate3d"));
        if (!guildPill) return;
        this.guildPillPatch = Utilities.monkeyPatch(guildPill, "default", {after: (data) => {
            const props = data.methodArguments[0];
            if (props.unread) data.returnValue.props.className += " bd-unread";
            if (props.selected) data.returnValue.props.className += " bd-selected";
            if (props.hovered) data.returnValue.props.className += " bd-hovered";
            return data.returnValue;
        }});
    }

    patchGuildSeparator() {
        if (this.guildSeparatorPatch) return;
        const Guilds = WebpackModules.getByDisplayName("Guilds");
        const guildComponents = WebpackModules.getByProps("renderListItem");
        if (!guildComponents || !Guilds) return;
        const GuildSeparator = function() {
            const returnValue = guildComponents.Separator(...arguments);
            returnValue.props.className += " bd-guild-separator";
            return returnValue;
        };
        this.guildSeparatorPatch = Utilities.monkeyPatch(Guilds.prototype, "render", {after: (data) => {
            data.returnValue.props.children[1].props.children[3].type = GuildSeparator;
        }});
    }

};

// lc = WebpackModules.getByDisplayName("FluxContainer(Layers)")
// Patcher.after(lc.prototype, "render", (t,a,r) => {console.log(t,a,r);})
// return.type
// Patcher.after(temp3.prototype, "renderLayers", (t,a,r) => {
//     console.log(t,a,r);
//     if (t.props.layers.includes("USER_SETTINGS")) r[1].props.className = "user-settings-prop";
//     })