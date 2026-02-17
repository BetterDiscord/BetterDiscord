import Builtin from "@structs/builtin";
import {getLazy, getLazyByDisplayName, getLazyByStrings, Stores} from "@webpack";
import {findInTree} from "@common/utils";
import React from "react";

const MessageGroupingContext = React.createContext({
    first: false,
    last: false
});

export default new class ThemeAttributes extends Builtin {
    get name() {return "ThemeAttributes";}
    get category() {return "general";}
    get id() {return "themeAttributes";}

    async patchMessage() {
        const MessageComponent = await getLazy(m => String(m.type).includes("Message must not be a thread starter message"), {
            cacheId: "core-themeattributes-MessageComponent"
        });

        this.after(MessageComponent!, "type", (_, [props], returnValue) => {
            const {first, last} = React.useContext(MessageGroupingContext);

            const li = findInTree(returnValue, (node) => node?.className?.includes("messageListItem"));
            if (!li) return;

            const author = findInTree(props, (arg) => arg?.username, {walkable: ["message", "author"]});
            const authorId = author?.id;
            if (!authorId) return;

            li["data-author-id"] = authorId;
            li["data-author-username"] = author?.username;
            li["data-is-self"] = author.id === Stores.UserStore?.getCurrentUser?.()?.id;

            // Deleted accounts have the discrimator 0000 but do not have bot
            li["data-is-webhook"] = author.discriminator === "0000" && author.bot;

            li["data-author-is-deleted"] = author.id === "456226577798135808";
            li["data-author-is-bot"] = author.bot && author.discriminator !== "0000";
            // li["data-author-is-deleted"] = author.discriminator === "0000" && author.username === "Deleted User" && !author.bot;

            li["data-message-group-start"] = first;
            li["data-message-group-end"] = last;

            li["data-message-is-reply"] = props?.message?.messageReference?.type === 0;
            li["data-message-is-forward"] = props?.message?.messageReference?.type === 1;
        });
    }

    async patchMessageHook() {
        const messageHook = await getLazyByStrings(["SUMMARIES_UNREAD_BAR_VIEWED,{num_unread_summaries"], {
            cacheId: "core-themeattributes-messageHook",
            defaultExport: false
        });

        this.after(messageHook!, "A", (_, __, res) => {
            if (!Array.isArray(res.channelStreamMarkup)) return;

            const channelStreamMarkup: Array<[number, React.ReactElement<any, any>]> = [];
            for (let index = 0; index < res.channelStreamMarkup.length; index++) {
                const element = res.channelStreamMarkup[index];

                if (React.isValidElement(element) && typeof (element as React.ReactElement<any, any>).props.groupId === "string") {
                    channelStreamMarkup.push([index, element]);
                }
            }

            if (!channelStreamMarkup.length) return;

            for (let i = 0; i < channelStreamMarkup.length; i++) {
                const [index, element] = channelStreamMarkup[i];
                const next = channelStreamMarkup[i + 1];
                const pre = channelStreamMarkup[i - 1];

                let first = true;
                if (typeof pre === "object") {
                    first = pre[1].props.groupId !== element.props.groupId;
                }

                let last = false;
                if (!next) last = true;
                else if (element.props.groupId !== next[1].props.groupId) last = true;

                // We could directly pass props to the Message component
                // but we will not be doing that
                res.channelStreamMarkup[index] = <MessageGroupingContext value={{last, first}}>{res.channelStreamMarkup[index]}</MessageGroupingContext>;
            }
        });
    }

    async patchVoiceUserComponent() {
        const VoiceUserComponent = await getLazyByStrings(["userNameClassName:", "avatarContainerClass:"], {
            cacheId: "core-themeattributes-VoiceUserComponent",
            defaultExport: false
        });

        this.after(VoiceUserComponent!, "Ay", (_, [{speaking}], returnValue) => {
            const VoiceUser = findInTree(returnValue, (node) => node?.attributes, {walkable: ["ref", "current"]});
            if (!VoiceUser) return;
            VoiceUser.dataset.speaking = speaking;
        });
    }

    async patchTabBarComponent() {
        const TabBarComponent = await getLazyByStrings(["({getFocusableElements:()=>{let"], {searchExports: true, firstId: 158954, cacheId: "core-themeattributes-TabBar"});

        this.after(TabBarComponent?.Item?.prototype, "render", (thisObject, _, returnValue) => {
            returnValue.props["data-tab-id"] = thisObject?.props?.id;
        });
    }

    async patchUserProfileComponent() {
        const UserProfileComponent = await getLazy((m) => m.render?.toString?.().includes("pendingThemeColors"), {firstId: 946356, cacheId: "core-themeattributes-UserProfile"});

        this.after(UserProfileComponent!, "render", (_, [{user}], returnValue) => {
            returnValue.props["data-member-id"] = user.id;
            returnValue.props["data-is-self"] = !!user.email;
        });
    }

    async patchChatAvatar() {
        const ChatAvatar = await getLazy(m => String(m.type).includes("showCommunicationDisabledStyles"), {
            cacheId: "core-themeattributes-ChatAvatar"
        });

        this.after(ChatAvatar!, "type", (_, __, res) => {
            if (res.props.avatar) {
                const avatar = findInTree(res.props.avatar, m => typeof m?.props?.children === "function");

                if (avatar.props.__bdPatched) return;

                const children = avatar.props.children;

                Object.assign(avatar.props, {
                    children(...args: never) {
                        const ret = children.apply(this, args);

                        const pfp = findInTree(ret, m => m?.type === "img" && m?.props?.className?.includes("avatar") && m.props.ref, {
                            walkable: ["props", "children"]
                        });

                        if (!pfp?.props?.src || pfp.props.src.startsWith("data:")) return ret;

                        pfp.props.style ??= {};

                        for (const size of [128, 256, 512, 1024, 2048, 4096]) {
                            pfp.props.style[`--avatar-url-${size}`] = `url(${pfp.props.src.replace(/\d+$/, String(size))})`;
                        }

                        return ret;
                    },
                    __bdPatched: true
                });
            }
        });
    }

    async patchAvatars() {
        const AvatarImg = await getLazyByDisplayName("AvatarImg", {
            searchExports: true,
            cacheId: "core-themeattributes-AvatarImg"
        })!;

        this.after(AvatarImg!, "render", (_, __, res) => {
            const pfp = findInTree(res, m => m?.type === "img" && m?.props?.className?.includes("avatar"), {
                walkable: ["props", "children"]
            });

            if (!pfp?.props?.src || pfp.props.src.startsWith("data:")) return;

            pfp.props.style ??= {};

            for (const size of [128, 256, 512, 1024, 2048, 4096]) {
                pfp.props.style[`--avatar-url-${size}`] = `url(${pfp.props.src.replace(/\d+$/, String(size))})`;
            }
        });
    }

    async enabled() {
        this.patchMessage();
        this.patchMessageHook();
        this.patchTabBarComponent();
        this.patchUserProfileComponent();
        this.patchVoiceUserComponent();
        this.patchChatAvatar();
        this.patchAvatars();
    }

    async disabled() {
        this.unpatchAll();
    }
};