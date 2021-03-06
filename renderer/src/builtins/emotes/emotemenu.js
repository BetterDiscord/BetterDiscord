import Builtin from "../../structs/builtin";
import {Utilities, WebpackModules, React} from "modules";
import EmoteModule from "./emotes";
import EmoteMenuCard from "../../ui/emotemenucard";
import EmoteIcon from "../../ui/emoteicon";
import Category from "./category";
import Favorite from "../../ui/icons/favorite";
import Twitch from "../../ui/icons/twitch";
const EmojiPicker = WebpackModules.find(m => m.type && m.type.displayName == "ExpressionPicker");

export default new class EmoteMenu extends Builtin {
    get name() {return "EmoteMenu";}
    get collection() {return "emotes";}
    get category() {return "general";}
    get id() {return "emoteMenu";}
    get hideEmojisID() {return "hideEmojiMenu";}
    get hideEmojis() {return this.get(this.hideEmojisID);}

    getSelected(body) {
        if (body[1]) return {id: "stickers", index: 1};
        else if (body[2]) return {id: "gif", index: 2};
        else if (body[3]) return {id: "emoji", index: 3};
        return {id: "bd-emotes", index: 3};
    }

    enabled() {
        this.after(EmojiPicker, "type", (_, __, returnValue) => {
            const head = Utilities.getNestedProp(returnValue, "props.children.props.children.props.children.1.props.children.0.props.children.props.children");
            const body = Utilities.getNestedProp(returnValue, "props.children.props.children.props.children.1.props.children");
            if (!head || !body) return returnValue;

            let activePicker = this.getSelected(body);
            let isActive = activePicker.id == "bd-emotes";
            const tabProps = head[0].props;
            if (!isActive && activePicker.id == "emoji" && this.hideEmojis) {
                activePicker = {id: "bd-emotes", index: 3};
                isActive = true;
            }
            if (this.hideEmojis) head.splice(head.findIndex(e => e && e.props && e.props.id == "emoji-picker-tab"), 1);
            head.push(
                React.createElement("div", {
                    "id": "bd-emotes-tab",
                    "role": "tab",
                    "aria-selected": isActive,
                    "className": tabProps.className,
                }, React.createElement(tabProps.children.type, {
                    viewType: "bd-emotes",
                    isActive: isActive,
                }, "Twitch")
            ));
            if (isActive) {
                body[activePicker.index] = React.createElement(EmoteMenuCard, {
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
                    }, Object.keys(EmoteModule.getCategory("TwitchGlobal")).map(emote=> {
                        const url = EmoteModule.getUrl("TwitchGlobal", emote);
                        return React.createElement(EmoteIcon, {emote, url});
                    }))
                ]);
            }
        });
    }

    disabled() {
        this.unpatchAll();
    }

};