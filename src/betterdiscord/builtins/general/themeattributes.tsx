import Builtin from "@structs/builtin";
import {Filters, getLazy, getLazyBySource, getLazyByStrings, getMangledLazy, Stores} from "@webpack";
import {findInTree} from "@common/utils";
import React, {createContext, useContext, useLayoutEffect, useMemo} from "react";

interface MessageGroupingState {
    first: boolean,
    last: boolean,
}

type MessageGroupingListener = (props: MessageGroupingState) => void;

type MessageGroupingSubscriber = (listener: MessageGroupingListener) => ReturnType<React.EffectCallback>;

const MessageGroupingEvents = createContext<MessageGroupingSubscriber>(() => () => {});

export default new class ThemeAttributes extends Builtin {
    get name() {return "ThemeAttributes";}
    get category() {return "general";}
    get id() {return "themeAttributes";}

    async patchMessage() {
        const MessageComponent = await getLazyBySource(["Message must not be a thread starter message"], {
            cacheId: "core-themeattributes-MessageComponent",
            searchDefault: false,
            declarationFilter: m => String(m.type).includes("Message must not be a thread starter message")
        });

        this.after(MessageComponent!, "type", (_, [props], returnValue) => {
            const subscribe = useContext(MessageGroupingEvents);

            const li = findInTree(returnValue, (n) => n?.className?.includes("messageListItem"));

            useLayoutEffect(() => {
                return subscribe(({first, last}) => {
                    if (!li?.id) return;

                    const node = document.getElementById(li.id);

                    if (!node) return;

                    node.setAttribute("data-message-group-start", first.toString());
                    node.setAttribute("data-message-group-end", last.toString());
                });
            }, [subscribe, li?.id]);

            if (!li) return;

            const author = findInTree(props, (arg) => arg?.username, {walkable: ["message", "author"]});
            const authorId = author?.id;
            if (!authorId) return;

            li["data-author-id"] = authorId;
            li["data-author-username"] = author?.username;
            li["data-is-self"] = author.id === Stores.UserStore?.getCurrentUser?.()?.id;

            // Deleted accounts have the discriminator 0000 but do not have bot
            li["data-is-webhook"] = author.discriminator === "0000" && author.bot;

            li["data-author-is-deleted"] = author.id === "456226577798135808";
            li["data-author-is-bot"] = author.bot && author.discriminator !== "0000";

            li["data-message-is-reply"] = props?.message?.messageReference?.type === 0;
            li["data-message-is-forward"] = props?.message?.messageReference?.type === 1;
        });
    }

    async patchMessageHook() {
        const messageHook = await getMangledLazy("SUMMARIES_UNREAD_BAR_VIEWED,{num_unread_summaries", {
            key: Filters.byStrings("SUMMARIES_UNREAD_BAR_VIEWED,{num_unread_summaries")
        }, {
            cacheId: "core-themeattributes-messageHook",
            mapDeclarations: true
        });

        this.after(messageHook!, "key", (_, __, res) => {
            const node = findInTree(res, m => m?.["data-list-id"] === "chat-messages", {
                walkable: ["props", "children"]
            });

            const {
                createSubscriber,
                start,
                end,
                invalidate,
                dispatch
            } = useMemo<{
                createSubscriber(message: string, state: MessageGroupingState): MessageGroupingSubscriber;
                start(): void;
                end(): void;
                invalidate(): void;
                dispatch(): void;
            }>(() => {
                const messageListeners: Record<string, ReturnType<typeof createNewSubscriber>> = {};

                const badListeners: string[] = [];

                function createNewSubscriber(): {
                    subscribe: MessageGroupingSubscriber,
                    updateState(state: MessageGroupingState): void;
                    dispatch(): void;
                } {
                    const listeners = new Set<MessageGroupingListener>();

                    let state: MessageGroupingState | undefined;

                    let shouldDispatch = false;

                    return {
                        subscribe(listener) {
                            if (state) {
                                listener(state);
                                shouldDispatch = false;
                            }

                            listeners.add(listener);
                            return () => void listeners.delete(listener);
                        },
                        updateState(newState) {
                            if (!state) shouldDispatch = true;
                            else shouldDispatch = state.last !== newState.last || state.first !== newState.first;
                            state = newState;
                        },
                        dispatch() {
                            if (!shouldDispatch) return;

                            for (const element of listeners) {
                                element(state!);
                            }

                            shouldDispatch = false;
                        }
                    };
                }

                return {
                    start() {
                        badListeners.length = 0;
                        badListeners.push(...Object.keys(messageListeners));
                    },
                    end() {
                        const good = Object.keys(messageListeners);

                        for (let index = 0; index < badListeners.length; index++) {
                            const id = badListeners[index];

                            if (good.includes(id)) continue;

                            delete messageListeners[id];
                        };

                        badListeners.length = 0;
                    },
                    invalidate() {
                        for (let index = 0; index < badListeners.length; index++) {
                            delete messageListeners[badListeners[index]];
                        };

                        badListeners.length = 0;
                    },
                    createSubscriber(message, state) {
                        const {subscribe, updateState} = messageListeners[message] ??= createNewSubscriber();

                        updateState(state);

                        return subscribe;
                    },
                    dispatch() {
                        for (const key in messageListeners) {
                            if (!Object.hasOwn(messageListeners, key)) continue;

                            messageListeners[key].dispatch();
                        }
                    }
                };
            }, []);

            useLayoutEffect(() => dispatch());

            if (!Array.isArray(node?.children)) return invalidate();

            const baseChannelStreamMarkup = node.children.find(Array.isArray);

            if (!baseChannelStreamMarkup) return invalidate();

            const channelStreamMarkup: Array<[number, React.ReactElement<any, any>]> = [];
            for (let index = 0; index < baseChannelStreamMarkup.length; index++) {
                const element = baseChannelStreamMarkup[index];

                if (React.isValidElement(element) && typeof (element as React.ReactElement<any, any>).props.groupId === "string") {
                    channelStreamMarkup.push([index, element]);
                }
            }

            if (!channelStreamMarkup.length) return invalidate();

            start();

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
                baseChannelStreamMarkup[index] = (
                    <MessageGroupingEvents value={createSubscriber(element.props.message.id, {first, last})}>
                        {baseChannelStreamMarkup[index]}
                    </MessageGroupingEvents>
                );
            }

            end();
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
        const TabBarComponent = await getLazyByStrings<{Item: typeof React.PureComponent;}>(["({getFocusableElements:()=>{let"], {searchExports: true, firstId: 158954, cacheId: "core-themeattributes-TabBar"});

        this.after(TabBarComponent?.Item?.prototype, "render", (thisObject, _, returnValue) => {
            returnValue.props["data-tab-id"] = (thisObject as any)?.props?.id;
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

                if (!avatar || avatar.props.__bdPatched) return;

                const children = avatar.props.children;

                Object.assign(avatar.props, {
                    children(...args: unknown[]) {
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
        const AvatarImg = await getLazyBySource([".displayName=\"AvatarImg\""], {
            searchDefault: false,
            cacheId: "core-themeattributes-AvatarImg",
            declarationFilter: m => m?.displayName === "AvatarImg"
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