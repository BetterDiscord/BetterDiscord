export default {
    TwitchGlobal: {
        url: "https://twitchemotes.com/api_cache/v3/global.json",
        backup: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_global.json`,
        variable: "TwitchGlobal",
        getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0`,
        getOldData: (url, name) => { return {id: url.match(/\/([0-9]+)\//)[1], code: name, emoticon_set: 0, description: null}; }
    },
    TwitchSubscriber: {
        url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_subscriber.json`,
        variable: "TwitchSubscriber",
        getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e}/1.0`,
        getOldData: (url) => url.match(/\/([0-9]+)\//)[1]
    },
    FrankerFaceZ: {
        url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_ffz.json`,
        variable: "FrankerFaceZ",
        getEmoteURL: (e) => `https://cdn.frankerfacez.com/emoticon/${e}/1`,
        getOldData: (url) => url.match(/\/([0-9]+)\//)[1]
    },
    BTTV: {
        url: "https://api.betterttv.net/emotes",
        variable: "BTTV",
        parser: (data) => {
            const emotes = {};
            for (let e = 0, len = data.emotes.length; e < len; e++) {
                const emote = data.emotes[e];
                emotes[emote.regex] = emote.url;
            }
            return emotes;
        },
        getEmoteURL: (e) => `${e}`,
        getOldData: (url) => url
    },
    BTTV2: {
        url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_bttv.json`,
        variable: "BTTV2",
        oldVariable: "emotesBTTV2",
        getEmoteURL: (e) => `https://cdn.betterttv.net/emote/${e}/1x`,
        getOldData: (url) => url.match(/emote\/(.+)\//)[1]
    }
};