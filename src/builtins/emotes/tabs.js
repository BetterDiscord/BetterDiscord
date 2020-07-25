import {React} from "modules";
import EmoteModule from "./emotes";
import EmoteMenuCard from "../../ui/emotemenucard";
import EmoteIcon from "../../ui/emoteicon";
export default [
    {
        id: "twitchEmotes",
        label: "Twitch Emotes",
        element: () => React.createElement(EmoteMenuCard, {
            type: "twitch"
        }, Object.keys(EmoteModule.getCategory("TwitchGlobal")).map(emote=> {
            const url = EmoteModule.getUrl("TwitchGlobal", emote);
            return React.createElement(EmoteIcon, {emote, url});
        }))
    },
    {
        id: "favoriteEmotes",
        label: "Favorite Emotes",
        element: () => React.createElement(EmoteMenuCard, {
            type: "favourite"
        }, Object.entries(EmoteModule.favorites).map(([emote, url]) => {
            return React.createElement(EmoteIcon, {emote, url});
        }))
    }
];