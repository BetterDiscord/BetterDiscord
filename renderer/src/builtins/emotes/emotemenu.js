import Builtin from "../../structs/builtin";
import {Utilities, WebpackModules, React} from "modules";
import EmoteModule from "./emotes";
import EmoteMenuCard from "../../ui/emotemenucard";
import EmoteIcon from "../../ui/emoteicon";
import Category from "./category";
import Favorite from "../../ui/icons/favorite";
import Twitch from "../../ui/icons/twitch";

const EmojiPicker = WebpackModules.find(m => m.type && m.type.displayName == "ExpressionPicker");
const {useExpressionPickerStore} = WebpackModules.getByProps("useExpressionPickerStore") ?? {};

export default new class EmoteMenu extends Builtin {
    get name() {return "EmoteMenu";}
    get collection() {return "emotes";}
    get category() {return "general";}
    get id() {return "emoteMenu";}
    get hideEmojisID() {return "hideEmojiMenu";}
    get hideEmojis() {return this.get(this.hideEmojisID);}

    enabled() {
        this.after(EmojiPicker, "type", (_, __, returnValue) => {
            const originalChildren = Utilities.getNestedProp(returnValue, "props.children.props.children");
            if (!originalChildren || originalChildren.__patched) return;

            const activePicker = useExpressionPickerStore((state) => state.activeView);
            
            returnValue.props.children.props.children = (props) => {
                const childrenReturn = Reflect.apply(originalChildren, null, [props]);

                // Attach a try {} catch {} because this might crash the user.
                try {
                    const head = Utilities.findInReactTree(childrenReturn, (e) => e?.role === "tablist")?.children;
                    const body = Utilities.findInReactTree(childrenReturn, (e) => e?.[0]?.type === "nav");
                    if (!head || !body) return childrenReturn;

                    const isActive = activePicker == "bd-emotes";
                    const TabItem = head[0]?.type ?? (() => null);

                    if (!isActive && activePicker == "emoji" && this.hideEmojis) {
                        useExpressionPickerStore.setState({activeView: "bd-emotes"});
                    }

                    if (this.hideEmojis) {
                        const emojiTabIndex = head.findIndex((e) => e?.props?.id == "emoji-picker-tab");
                        if (emojiTabIndex > -1) head.splice(emojiTabIndex, 1);
                    }

                    head.push(
                        React.createElement(TabItem, {
                            "aria-controls": "bd-emotes",
                            "id": "bd-emotes",
                            "aria-selected": isActive,
                            "isActive": isActive,
                            "viewType": "bd-emotes"
                        }, "Twitch")
                    );
                    if (isActive) {
                        body.push(
                            React.createElement(EmoteMenuCard, {
                                type: "twitch",
                            }, [
                                React.createElement(Category, {
                                    label: "Favorites",
                                    icon: React.createElement(Favorite, {}),
                                }, Object.entries(EmoteModule.favorites).map(([emote, url]) => {
                                    return React.createElement(EmoteIcon, {emote, url});
                                })),
                                React.createElement(Category, {
                                    label: "Twitch Emotes",
                                    icon: React.createElement(Twitch, {}) 
                                }, Object.keys(EmoteModule.getCategory("TwitchGlobal")).map((emote) => {
                                    const url = EmoteModule.getUrl("TwitchGlobal", emote);
                                    return React.createElement(EmoteIcon, {emote, url});
                                }))
                            ])
                        );
                    }
                }
                catch (error) {
                    this.error("Error in EmojiPicker patch:\n", error);
                }

                return childrenReturn;
            };

            returnValue.props.children.props.children.__patched = true;
        });
    }

    disabled() {
        this.unpatchAll();
    }

};