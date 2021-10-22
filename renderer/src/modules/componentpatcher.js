import {Config} from "data";
import WebpackModules from "./webpackmodules";
import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Patcher from "./patcher";
import BDLogo from "../ui/icons/bdlogo";
import Logger from "common/logger";

const React = DiscordModules.React;
const Tooltip = WebpackModules.getByDisplayName("Tooltip");
const MutedStore = WebpackModules.getByProps("isMuted");
const Anchor = WebpackModules.getByDisplayName("Anchor");

const Developers = [
    /* Zerebos#7790 */
    "249746236008169473"
];

const DeveloperBadge = function DeveloperBadge({type, size = 16}) {
    return React.createElement(Tooltip, {color: "primary", position: "top", text: "BetterDiscord Developer"},
        props => React.createElement(Anchor, Object.assign({className: `bd-${type}-badge`, href: "https://github.com/BetterDiscord/BetterDiscord", title: "BetterDiscord", target: "_blank"}, props),
            React.createElement(BDLogo, {size, className: "bd-logo"})
        )
    );
};

export default new class ComponentPatcher {
    warn(...message) {return Logger.warn("ComponentPatcher", ...message);}
    error(...message) {return Logger.error("ComponentPatcher", ...message);}
    debug(...message) {return Logger.debug("ComponentPatcher", ...message);}

    initialize() {
        this.guildsClasses = WebpackModules.getByProps("downloadProgressCircle", "guilds");

        Utilities.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
    
        Utilities.suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
        Utilities.suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
        /*
        Utilities.suppressErrors(this.patchGuildSeparator.bind(this), "BD Guild Separator Patch")();
        */
        Utilities.suppressErrors(this.patchMessageHeader.bind(this), "BD Message Header Patch")();
        Utilities.suppressErrors(this.patchMemberList.bind(this), "BD Member List Patch")();
        Utilities.suppressErrors(this.patchProfile.bind(this), "BD Profile Badges Patch")();
    }

    patchSocial() {
        if (this.socialPatch) return;
        const TabBar = WebpackModules.getByDisplayName("TabBar");
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
                        DiscordModules.React.createElement(Anchor, {className: "bd-social-link", href: "https://twitter.com/_BetterDiscord_", title: "BetterDiscord", target: "_blank"},
                            DiscordModules.React.createElement(BDLogo, {size: "16px", className: "bd-social-logo"})
                        )
                    );
                    return returnVal;
                };
                children[children.length - 2].type = newOne;
            }

            const additional = DiscordModules.React.createElement("div", {className: "colorMuted-HdFt4q size12-3cLvbJ"}, `BetterDiscord ${Config.version}`);


            const originalVersions = children[children.length - 1].type;
            children[children.length - 1].type = function() {
                const returnVal = originalVersions(...arguments);
                returnVal.props.children.splice(1, 0, additional);
                return returnVal;
            };
        });
    }

    async forceUpdateGuilds() {
        const guildClasses = this.guildsClasses;
        if (!guildClasses) return this.warn("Failed to get guilds classes!");

        const guilds = await new Promise((resolve) => Utilities.onAdded(`.${guildClasses.guilds}`, resolve));
        const instance = Utilities.getOwnerInstance(guilds);
        if (!instance) return this.error("Failed to get Guilds instance.");

        instance.forceUpdate();
    }
    
    /**
     * @updated 24.09.2021
     */
    patchGuildListItems() {
        if (this.guildListItemsPatch) return;
        const GuildComponents = WebpackModules.getByProps("HubGuild");
        
        if (!GuildComponents || typeof(GuildComponents.default) !== "function") return this.error("Failed to get Guild component.");

        const isGuildMuted = function (guildId) {
            if (!MutedStore || typeof(MutedStore.isMuted) !== "function") return false;
    
            return MutedStore.isMuted(guildId);
        };

        function BDGuild(props) {
            const {originalGuild, ...guildProps} = props;
            const returnValue = Reflect.apply(originalGuild, this, [guildProps]);

            try {
                returnValue.props.className += " bd-guild";
                if (guildProps.unread) returnValue.props.className += " bd-unread";
                if (guildProps.selected) returnValue.props.className += " bd-selected";
                if (guildProps.audio) returnValue.props.className += " bd-audio";
                if (guildProps.video) returnValue.props.className += " bd-video";
                if (guildProps.badge) returnValue.props.className += " bd-badge";
                if (guildProps.animatable) returnValue.props.className += " bd-animatable";
                if (guildProps.unavailable) returnValue.props.className += " bd-unavailable";
                if (guildProps.screenshare) returnValue.props.className += " bd-screenshare";
                if (guildProps.liveStage) returnValue.props.className += " bd-live-stage";
                if (isGuildMuted(guildProps.guild.id)) returnValue.props.className += " bd-muted";
            }
            catch (err) {
                Logger.error("ComponentPatcher:Guilds", `Error inside BDGuild:`, err);
            }

            return returnValue;
        }

        this.guildListItemsPatch = Patcher.after("ComponentPatcher", GuildComponents, "default", (_, args, returnValue) => {
            if (!returnValue || !returnValue.props) return;
            
            const original = returnValue.type;
            
            Object.assign(returnValue.props, {
                originalGuild: original
            });

            returnValue.type = BDGuild;
        });

        this.forceUpdateGuilds();
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
    /*
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
    }*/

    /**
     * @updated 07.07.2021
     */
    patchMessageHeader() {
        if (this.messageHeaderPatch) return;
        const MessageTimestamp = WebpackModules.getModule(m => m?.default?.toString().indexOf("showTimestampOnHover") > -1);
        this.messageHeaderPatch = Patcher.after("ComponentPatcher", MessageTimestamp, "default", (_, [{message}], returnValue) => {
            const userId = Utilities.getNestedProp(message, "author.id");
            if (Developers.indexOf(userId) < 0) return;
            const children = Utilities.getNestedProp(returnValue, "props.children.1.props.children");
            if (!Array.isArray(children)) return;

            children.splice(2, 0, 
                React.createElement(DeveloperBadge, {
                    type: "chat"
                })
            );
        });
    }

    /**
     * @updated 07.07.2021
     */
    patchMemberList() {
        if (this.memberListPatch) return;
        const MemberListItem = WebpackModules.findByDisplayName("MemberListItem");
        if (!MemberListItem?.prototype?.renderDecorators) return;
        this.memberListPatch = Patcher.after("ComponentPatcher", MemberListItem.prototype, "renderDecorators", (thisObject, args, returnValue) => {
            const user = Utilities.getNestedProp(thisObject, "props.user");
            const children = Utilities.getNestedProp(returnValue, "props.children");
            if (!children || Developers.indexOf(user.id) < 0) return;
            if (!Array.isArray(children)) return;
            children.push(
               React.createElement(DeveloperBadge, {
                   type: "member"
               })
            );
        });
    }

    /**
     * @updated 07.07.2021
     */
    patchProfile() {
        if (this.profilePatch) return;
        const UserProfileBadgeList = WebpackModules.getModule(m => m?.default?.displayName === "UserProfileBadgeList");
        this.profilePatch = Patcher.after("ComponentPatcher", UserProfileBadgeList, "default", (_, [{user}], res) => {
            if (Developers.indexOf(user?.id) < 0) return;
            const children = Utilities.getNestedProp(res, "props.children");
            if (!Array.isArray(children)) return;

            children.unshift(
                React.createElement(DeveloperBadge, {
                    type: "profile",
                    size: 18
                })
            );
        });
    }

};

// as part of utility classes, i would like a way to distinguish channel types from the .content-3at_AU element. other than that, can't think of anything

// Tropical's notes

/*
html [maximized | bd | stable | canary | ptb]
.iconWrapper-2OrFZ1 [type]
.sidebar-2K8pFh [guild-id]
.wrapper-2jXpOf [voice | text | announcement | store | private | nsfw | rules]
.chat-3bRxxu [channnel-name | guild-id]
.listItem-2P_4kh [type | state]
.privateChannels-1nO12o [library-hidden]
.member-3-YXUe [user-id]
.message-2qnXI6 [type | author-id | group-end | message-content]
.wrapper-3t9DeA [user-id | status]
.userPopout-3XzG_A [user-id]
.root-SR8cQa [user-id]
.contentRegion-3nDuYy [settings-page]
.item-PXvHYJ [settings-page]
.wrapper-35wsBm [valid | expired | joined]
*/