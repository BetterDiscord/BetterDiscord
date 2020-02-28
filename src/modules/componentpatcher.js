import WebpackModules from "./webpackmodules";
import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Patcher from "./patcher";
import BDLogo from "../ui/icons/bdlogo";

export default new class ComponentPatcher {

    initialize() {
        Utilities.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
        Utilities.suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
        Utilities.suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
        Utilities.suppressErrors(this.patchGuildSeparator.bind(this), "BD Guild Separator Patch")();
    }

    patchSocial() {
        if (this.socialPatch) return;
        const TabBar = WebpackModules.getByDisplayName("TabBar");
        const Anchor = WebpackModules.getByDisplayName("Anchor");
        if (!TabBar || !Anchor) return;
        this.socialPatch = Patcher.after("ThemeHelper", TabBar.prototype, "render", (_, __, returnValue) => {
            const children = returnValue.props.children;
            if (!children || !children.length) return;
            if (children[children.length - 2].type.displayName !== "Separator") return;
            if (!children[children.length - 1].type.toString().includes("socialLinks")) return;
            const original = children[children.length - 1].type;
            const newOne = function() {
                const returnVal = original(...arguments);
                returnVal.props.children.push(DiscordModules.React.createElement(Anchor, {className: "bd-social-link", href: "https://github.com/rauenzi/BetterDiscordApp", rel: "author", title: "BandagedBD", target: "_blank"},
                    DiscordModules.React.createElement(BDLogo, {size: "16px", className: "bd-social-logo"})
                ));
                return returnVal;
            };
            children[children.length - 1].type = newOne;
        });
    }

    patchGuildListItems() {
        if (this.guildListItemsPatch) return;
        const listItemClass = DiscordModules.GuildClasses.listItem.split(" ")[0];
        const blobClass = DiscordModules.GuildClasses.blobContainer.split(" ")[0];
        const reactInstance = Utilities.getReactInstance(document.querySelector(`.${listItemClass} .${blobClass}`).parentElement);
        const GuildComponent = reactInstance.return.type;
        if (!GuildComponent) return;
        this.guildListItemsPatch = Patcher.after("ThemeHelper", GuildComponent.prototype, "render", (thisObject, _, returnValue) => {
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
        this.guildPillPatch = Patcher.after("ThemeHelper", guildPill, "default", (_, args, returnValue) => {
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
            const returnValue = guildComponents.Separator(...arguments);
            returnValue.props.className += " bd-guild-separator";
            return returnValue;
        };
        this.guildSeparatorPatch = Patcher.after("ThemeHelper", Guilds.prototype, "render", (_, __, returnValue) => {
            const Separator = Utilities.findInReactTree(returnValue, m => m.type && !m.type.displayName && typeof(m.type) == "function" && Utilities.isEmpty(m.props));
            if (!Separator) return;
            Separator.type = GuildSeparator;
        });
    }

};