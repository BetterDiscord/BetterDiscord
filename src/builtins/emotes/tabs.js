import {React} from "modules";
import EmoteModule from "./emotes";
import EmoteMenuCard from "../../ui/emotemenucard";
import EmoteIcon from "../../ui/emoteicon";
export default [
    {
        id: "twitchEmotes",
        label: "Twitch Emotes",
        element: () => React.createElement(EmoteMenuCard, {
            children: Object.entries(EmoteModule.getCategory("TwitchGlobal")).map(([emote]) => {
                // if (!EmoteModule.getCategory("TwitchGlobal").hasOwnProperty(emote)) return null;
                const url = EmoteModule.getUrl("TwitchGlobal", emote);
                return <EmoteIcon url={url} emote={emote}/>
            }),
            type: "twitch"
        })
    },
    {
        id: "favoriteEmotes",
        label: "Favorite Emotes",
        element: () => React.createElement(EmoteMenuCard, {
            children: Object.entries(EmoteModule.favorites).map(([emote, url]) => {
                return <EmoteIcon url={url} emote={emote}/>;
            }),
            type: "favourite"
        })
    }
]