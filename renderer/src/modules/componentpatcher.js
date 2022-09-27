import {Config} from "data";
import WebpackModules from "./webpackmodules";
import DiscordModules from "./discordmodules";
import DiscordClasses from "./discordclasses";
import Utilities from "./utilities";
import Patcher from "./patcher";
import BDLogo from "../ui/icons/bdlogo";
import Logger from "common/logger";

const React = DiscordModules.React;
const Tooltip = WebpackModules.getByPrototypes("renderTooltip");
const Anchor = WebpackModules.getByProps("Link");

const Developers = [
    /* Zerebos#7790 */
    "249746236008169473",
    
    /* Strencher#1044 */
    "415849376598982656"
];

const DeveloperBadge = function DeveloperBadge({type, size = 16}) {
    return React.createElement(Tooltip, {color: "primary", position: "top", text: "BetterDiscord Developer"},
        props => React.createElement(Anchor.Link, Object.assign({className: `bd-${type}-badge`, href: "https://github.com/BetterDiscord/BetterDiscord", title: "BetterDiscord", target: "_blank"}, props),
            React.createElement(BDLogo, {size, className: "bd-logo"})
        )
    );
};

export default new class ComponentPatcher {
    warn(...message) {return Logger.warn("ComponentPatcher", ...message);}
    error(...message) {return Logger.error("ComponentPatcher", ...message);}
    debug(...message) {return Logger.debug("ComponentPatcher", ...message);}

    initialize() {
        // Utilities.suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
        // Utilities.suppressErrors(this.patchMemberList.bind(this), "BD Member List Patch")();
        // Utilities.suppressErrors(this.patchProfile.bind(this), "BD Profile Badges Patch")();
    }

    patchSocial() {
        if (this.socialPatch) return;
        const TabBar = WebpackModules.getByProps("Types", "Looks", "Header");
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

    async patchMemberList() {
        if (this.memberListPatch) return;
        const memo = WebpackModules.find(m => m?.type?.toString().includes("useGlobalHasAvatarDecorations"));
        if (!memo?.type) return;
        const MemberListItem = await new Promise(resolve => {
            const cancelFindListItem = Patcher.after("ComponentPatcher", memo, "type", (_, props, returnValue) => {
                cancelFindListItem();
                resolve(returnValue?.type);
            });
        });
        if (!MemberListItem?.prototype?.renderDecorators) return;
        this.memberListPatch = Patcher.after("ComponentPatcher", MemberListItem.prototype, "renderDecorators", (thisObject, args, returnValue) => {
            const user = Utilities.getNestedProp(thisObject, "props.user");
            const children = Utilities.getNestedProp(returnValue, "props.children");
            if (!children || Developers.indexOf(user?.id) < 0) return;
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
        const UserProfileBadgeLists = WebpackModules.getModule(m => m?.toString()?.includes("PROFILE_USER_BADGES"), {first: false});
        for (const UserProfileBadgeList of UserProfileBadgeLists) {
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
    }

};