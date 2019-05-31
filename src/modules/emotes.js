import {Config, SettingsCookie, Emotes, EmoteBlacklist} from "data";
import Utilities from "./utilities";
import BDV2 from "./bdv2";
import BDEmote from "../ui/emote";
import BdApi from "./pluginapi";
import DataStore from "./datastore";
import {DiscordModules} from "./webpackmodules";
import {Toasts} from "ui";

const bdEmoteSettingIDs = {
    TwitchGlobal: "bda-es-7",
    TwitchSubscriber: "bda-es-7",
    BTTV: "bda-es-2",
    FrankerFaceZ: "bda-es-1",
    BTTV2: "bda-es-2"
};

function EmoteModule() {
    Object.defineProperty(this, "categories", {
        get: function() {
            const cats = [];
            for (const current in bdEmoteSettingIDs) {
                if (SettingsCookie[bdEmoteSettingIDs[current]]) cats.push(current);
            }
            return cats;
        }
    });
}

EmoteModule.prototype.init = async function () {
    this.modifiers = ["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"];
    this.overrides = ["twitch", "bttv", "ffz"];

    const emoteInfo = {
        TwitchGlobal: {
            url: "https://twitchemotes.com/api_cache/v3/global.json",
            backup: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_global.json`,
            variable: "TwitchGlobal",
            oldVariable: "emotesTwitch",
            getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0`,
            getOldData: (url, name) => { return {id: url.match(/\/([0-9]+)\//)[1], code: name, emoticon_set: 0, description: null}; }
        },
        TwitchSubscriber: {
            url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_subscriber.json`,
            variable: "TwitchSubscriber",
            oldVariable: "subEmotesTwitch",
            getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e}/1.0`,
            getOldData: (url) => url.match(/\/([0-9]+)\//)[1]
        },
        FrankerFaceZ: {
            url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_ffz.json`,
            variable: "FrankerFaceZ",
            oldVariable: "emotesFfz",
            getEmoteURL: (e) => `https://cdn.frankerfacez.com/emoticon/${e}/1`,
            getOldData: (url) => url.match(/\/([0-9]+)\//)[1]
        },
        BTTV: {
            url: "https://api.betterttv.net/emotes",
            variable: "BTTV",
            oldVariable: "emotesBTTV",
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

    await this.getBlacklist();
    await this.loadEmoteData(emoteInfo);

    while (!BDV2.MessageContentComponent) await new Promise(resolve => setTimeout(resolve, 100));

    if (this.cancelEmoteRender) return;
    this.cancelEmoteRender = Utilities.monkeyPatch(BDV2.MessageContentComponent.prototype, "render", {after: ({returnValue}) => {
		Utilities.monkeyPatch(returnValue.props, "children", {silent: true, after: ({returnValue}) => {
            if (this.categories.length == 0) return;
			const markup = returnValue.props.children[1];
			if (!markup.props.children) return;
			const nodes = markup.props.children[1];
			if (!nodes || !nodes.length) return;
			for (let n = 0; n < nodes.length; n++) {
				const node = nodes[n];
				if (typeof(node) !== "string") continue;
                const words = node.split(/([^\s]+)([\s]|$)/g);
				for (let c = 0, clen = this.categories.length; c < clen; c++) {
					for (let w = 0, wlen = words.length; w < wlen; w++) {
                        const emote = words[w];
						const emoteSplit = emote.split(":");
						const emoteName = emoteSplit[0];
						let emoteModifier = emoteSplit[1] ? emoteSplit[1] : "";
						let emoteOverride = emoteModifier.slice(0);

						if (emoteName.length < 4 || EmoteBlacklist.includes(emoteName)) continue;
						if (!this.modifiers.includes(emoteModifier) || !SettingsCookie["bda-es-8"]) emoteModifier = "";
						if (!this.overrides.includes(emoteOverride)) emoteOverride = "";
						else emoteModifier = emoteOverride;

						let current = this.categories[c];
						if (emoteOverride === "twitch") {
							if (Emotes.TwitchGlobal[emoteName]) current = "TwitchGlobal";
							else if (Emotes.TwitchSubscriber[emoteName]) current = "TwitchSubscriber";
						}
						else if (emoteOverride === "bttv") {
							if (Emotes.BTTV[emoteName]) current = "BTTV";
							else if (Emotes.BTTV2[emoteName]) current = "BTTV2";
						}
						else if (emoteOverride === "ffz") {
							if (Emotes.FrankerFaceZ[emoteName]) current = "FrankerFaceZ";
						}

						if (!Emotes[current][emoteName] || !SettingsCookie[bdEmoteSettingIDs[current]]) continue;
						const results = nodes[n].match(new RegExp(`([\\s]|^)${Utilities.escape(emoteModifier ? emoteName + ":" + emoteModifier : emoteName)}([\\s]|$)`));
                        if (!results) continue;
						const pre = nodes[n].substring(0, results.index + results[1].length);
						const post = nodes[n].substring(results.index + results[0].length - results[2].length);
						nodes[n] = pre;
						const emoteComponent = DiscordModules.React.createElement(BDEmote, {name: emoteName, url: Emotes[current][emoteName], modifier: emoteModifier});
						nodes.splice(n + 1, 0, post);
						nodes.splice(n + 1, 0, emoteComponent);
					}
				}
			}
			const onlyEmotes = nodes.every(r => {
				if (typeof(r) == "string" && r.replace(/\s*/, "") == "") return true;
				else if (r.type && r.type.name == "BDEmote") return true;
				else if (r.props && r.props.children && r.props.children.props && r.props.children.props.emojiName) return true;
				return false;
			});
			if (!onlyEmotes) return;

			for (const node of nodes) {
				if (typeof(node) != "object") continue;
				if (node.type.name == "BDEmote") node.props.jumboable = true;
				else if (node.props && node.props.children && node.props.children.props && node.props.children.props.emojiName) node.props.children.props.jumboable = true;
			}
		}});
    }});
};

EmoteModule.prototype.disable = function() {
    this.disableAutoCapitalize();
    if (this.cancelEmoteRender) return;
    this.cancelEmoteRender();
    this.cancelEmoteRender = null;
};

EmoteModule.prototype.clearEmoteData = async function() {
    const _fs = require("fs");
    const emoteFile = "emote_data.json";
    const file = Config.dataPath + emoteFile;
    const exists = _fs.existsSync(file);
    if (exists) _fs.unlinkSync(file);
    DataStore.setBDData("emoteCacheDate", (new Date()).toJSON());

    Object.assign(Emotes, {
        TwitchGlobal: {},
        TwitchSubscriber: {},
        BTTV: {},
        FrankerFaceZ: {},
        BTTV2: {}
    });
};

EmoteModule.prototype.isCacheValid = function() {
    const cacheLength = DataStore.getBDData("emoteCacheDays") || DataStore.setBDData("emoteCacheDays", 7) || 7;
    const cacheDate = new Date(DataStore.getBDData("emoteCacheDate") || null);
    const currentDate = new Date();
    const daysBetween = Math.round(Math.abs((currentDate.getTime() - cacheDate.getTime()) / (24 * 60 * 60 * 1000)));
    if (daysBetween > cacheLength) {
        DataStore.setBDData("emoteCacheDate", currentDate.toJSON());
        return false;
    }
    return true;
};

EmoteModule.prototype.loadEmoteData = async function(emoteInfo) {
    const _fs = require("fs");
    const emoteFile = "emote_data.json";
    const file = Config.dataPath + emoteFile;
    const exists = _fs.existsSync(file);

    if (exists && this.isCacheValid()) {
        if (SettingsCookie["fork-ps-2"]) Toasts.show("Loading emotes from cache.", {type: "info"});
        Utilities.log("Emotes", "Loading emotes from local cache.");

        const data = await new Promise(resolve => {
            _fs.readFile(file, "utf8", (err, data) => {
                Utilities.log("Emotes", "Emotes loaded from cache.");
                if (err) data = {};
                resolve(data);
            });
        });

        let isValid = Utilities.testJSON(data);
        if (isValid) Object.assign(Emotes, JSON.parse(data));

        for (const e in emoteInfo) {
            isValid = Object.keys(Emotes[emoteInfo[e].variable]).length > 0;
        }

        if (isValid) {
            if (SettingsCookie["fork-ps-2"]) Toasts.show("Emotes successfully loaded.", {type: "success"});
            return;
        }

        Utilities.log("Emotes", "Cache was corrupt, downloading...");
        _fs.unlinkSync(file);
    }

    if (!SettingsCookie["fork-es-3"]) return;
    if (SettingsCookie["fork-ps-2"]) Toasts.show("Downloading emotes in the background do not reload.", {type: "info"});

    for (const e in emoteInfo) {
        await new Promise(r => setTimeout(r, 1000));
        const data = await this.downloadEmotes(emoteInfo[e]);
        Emotes[emoteInfo[e].variable] = data;
    }

    if (SettingsCookie["fork-ps-2"]) Toasts.show("All emotes successfully downloaded.", {type: "success"});

    try { _fs.writeFileSync(file, JSON.stringify(Emotes), "utf8"); }
    catch (err) { Utilities.err("Emotes", "Could not save emote data.", err); }
};

EmoteModule.prototype.downloadEmotes = function(emoteMeta) {
    const request = require("request");
    const options = {
        url: emoteMeta.url,
        timeout: emoteMeta.timeout ? emoteMeta.timeout : 5000
    };

    Utilities.log("Emotes", `Downloading: ${emoteMeta.variable} (${emoteMeta.url})`);

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                Utilities.err("Emotes", "Could not download " + emoteMeta.variable, error);
                if (emoteMeta.backup) {
                    emoteMeta.url = emoteMeta.backup;
                    emoteMeta.backup = null;
                    if (emoteMeta.backupParser) emoteMeta.parser = emoteMeta.backupParser;
                    return resolve(this.downloadEmotes(emoteMeta));
                }
                return reject({});
            }

            let parsedData = {};
            try {
                parsedData = JSON.parse(body);
            }
            catch (err) {
                Utilities.err("Emotes", "Could not download " + emoteMeta.variable, err);
                if (emoteMeta.backup) {
                    emoteMeta.url = emoteMeta.backup;
                    emoteMeta.backup = null;
                    if (emoteMeta.backupParser) emoteMeta.parser = emoteMeta.backupParser;
                    return resolve(this.downloadEmotes(emoteMeta));
                }
                return reject({});
            }
            if (typeof(emoteMeta.parser) === "function") parsedData = emoteMeta.parser(parsedData);

            for (const emote in parsedData) {
                if (emote.length < 4 || EmoteBlacklist.includes(emote)) {
                    delete parsedData[emote];
                    continue;
                }
                parsedData[emote] = emoteMeta.getEmoteURL(parsedData[emote]);
            }
            resolve(parsedData);
            Utilities.log("Emotes", "Downloaded: " + emoteMeta.variable);
        });
    });
};

EmoteModule.prototype.getBlacklist = function () {
    return new Promise(resolve => {
        $.getJSON(`https://rauenzi.github.io/BetterDiscordApp/data/emotefilter.json`, function (data) {
            resolve(EmoteBlacklist.push(...data.blacklist));
        });
    });
};

EmoteModule.prototype.autoCapitalize = function () {
    if (!SettingsCookie["bda-es-4"] || this.autoCapitalizeActive) return;
    $("body").on("keyup.bdac change.bdac paste.bdac", $(".channelTextArea-1LDbYG textarea:first"), () => {
        const text = $(".channelTextArea-1LDbYG textarea:first").val();
        if (text == undefined) return;

        const lastWord = text.split(" ").pop();
        if (lastWord.length > 3) {
            if (lastWord == "danSgame") return;
            const ret = this.capitalize(lastWord.toLowerCase());
            if (ret !== null && ret !== undefined) {
                Utilities.insertText(Utilities.getTextArea()[0], text.replace(lastWord, ret));
            }
        }
    });
    this.autoCapitalizeActive = true;
};

EmoteModule.prototype.capitalize = function (value) {
    const res = Emotes.TwitchGlobal;
    for (const p in res) {
        if (res.hasOwnProperty(p) && value == (p + "").toLowerCase()) {
            return p;
        }
    }
};

EmoteModule.prototype.disableAutoCapitalize = function() {
    this.autoCapitalizeActive = false;
    $("body").off(".bdac");
};

export default new EmoteModule();