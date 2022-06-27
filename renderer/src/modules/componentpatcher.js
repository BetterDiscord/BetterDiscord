import {Config} from "data";
import WebpackModules from "./webpackmodules";
import DiscordModules from "./discordmodules";
import DiscordClasses from "./discordclasses";
import Utilities from "./utilities";
import Patcher from "./patcher";
import BDLogo from "../ui/icons/bdlogo";
import Logger from "common/logger";

const React = DiscordModules.React;
const Tooltip = WebpackModules.getByDisplayName("Tooltip");
const Anchor = WebpackModules.getByDisplayName("Anchor");

const Developers = [
    /* Zerebos#7790 */
    "249746236008169473",
    
    /* Strencher#1044 */
    "415849376598982656"
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
        Utilities.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
        Utilities.suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
        Utilities.suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
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

            const additional = DiscordModules.React.createElement("div", {className: `${DiscordClasses.Text.colorMuted} ${DiscordClasses.Text.size12}`}, `BetterDiscord ${Config.version}`);


            const originalVersions = children[children.length - 1].type;
            children[children.length - 1].type = function() {
                const returnVal = originalVersions(...arguments);
                returnVal.props.children.splice(1, 0, additional);
                return returnVal;
            };
        });
    }
    
    patchGuildListItems() {
        if (this.guildListItemsPatch) return;
        const ListNavigators = WebpackModules.getByProps("ListNavigatorProvider");
        const GuildComponent = WebpackModules.find(m => m.type && m.type.toString().includes("guildNode") && m.type.toString().includes("treeitem"));
        if (!GuildComponent || typeof(GuildComponent.type) !== "function") return this.warn("Failed to get Guild component.");
        if (!ListNavigators || typeof(ListNavigators.ListNavigatorProvider) !== "function") return this.warn("Failed to get ListNavigatorProvider component.");

        this.guildListItemsPatch = Patcher.after("ComponentPatcher", GuildComponent, "type", (_, [props], returnValue) => {
            if (!returnValue || !returnValue.props) return;
            
            try {
                returnValue.props.className += " bd-guild";
                if (props.unread) returnValue.props.className += " bd-unread";
                if (props.selected) returnValue.props.className += " bd-selected";
                if (props.mediaState.audio) returnValue.props.className += " bd-audio";
                if (props.mediaState.video) returnValue.props.className += " bd-video";
                if (props.badge) returnValue.props.className += " bd-badge";
                if (props.animatable) returnValue.props.className += " bd-animatable";
                if (props.unavailable) returnValue.props.className += " bd-unavailable";
                if (props.mediaState.screenshare) returnValue.props.className += " bd-screenshare";
                if (props.mediaState.liveStage) returnValue.props.className += " bd-live-stage";
                if (props.muted) returnValue.props.className += " bd-muted";
            }
            catch (err) {
                Logger.error("ComponentPatcher:Guilds", `Error inside BDGuild:`, err);
                this.guildListItemsPatch();
            }
        });

        const {useState} = DiscordModules.React;
        function useForceUpdate() {
            const [, setValue] = useState(false);
            return () => setValue(v => !v); // update the state to force render
        }

        let hasForced = false;
        this.cancelForceUpdate = Patcher.after("ComponentPatcher", ListNavigators, "ListNavigatorProvider", (_, __, returnValue) => {
            if (returnValue.props.value.id !== "guildsnav") return;

            const originalParent = Utilities.findInTree(returnValue, m => m?.props?.className, {walkable: ["children", "props"]});
            if (!originalParent) return;
            const original = originalParent.type;
            originalParent.type = e => {
                const forceUpdate = useForceUpdate();
                if (!hasForced) {
                    hasForced = true;
                    setTimeout(() => {
                        forceUpdate();
                        this.cancelForceUpdate();
                    }, 1);
                }

                return Reflect.apply(original, null, [e]);
            };
        });
    }
    
    patchGuildPills() {
        if (this.guildPillPatch) return;
        const guildPill = WebpackModules.find(m => m.default.displayName === "AnimatedHalfPill");
        if (!guildPill) return;
        this.guildPillPatch = Patcher.after("ComponentPatcher", guildPill, "default", (_, args, returnValue) => {
            const props = args[0];
            if (props.unread) returnValue.props.className += " bd-unread";
            if (props.selected) returnValue.props.className += " bd-selected";
            if (props.hovered) returnValue.props.className += " bd-hovered";
            return returnValue;
        });
    }

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