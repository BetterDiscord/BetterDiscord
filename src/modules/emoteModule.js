import {bdConfig, settingsCookie, bemotes, bdEmoteSettingIDs, bdEmotes} from "../0globals";
import DataStore from "./dataStore";
import BDV2 from "./v2";
import Utils from "./utils";

import BDEmote from "../ui/bdEmote";

function EmoteModule() {
    Object.defineProperty(this, "categories", {
        get: function() {
            const cats = [];
            for (const current in bdEmoteSettingIDs) {
                if (settingsCookie[bdEmoteSettingIDs[current]]) cats.push(current);
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
            url: `https://gitcdn.xyz/repo/rauenzi/BetterDiscordApp/gh-pages/assets/emotedata_twitch_global.json`,
            variable: "TwitchGlobal",
            oldVariable: "emotesTwitch",
            getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e}/1.0`
        },
        TwitchSubscriber: {
            url: `https://gitcdn.xyz/repo/rauenzi/BetterDiscordApp/gh-pages/assets/emotedata_twitch_subscriber.json`,
            variable: "TwitchSubscriber",
            oldVariable: "subEmotesTwitch",
            getEmoteURL: (e) => `https://static-cdn.jtvnw.net/emoticons/v1/${e}/1.0`
        },
        FrankerFaceZ: {
            url: `https://gitcdn.xyz/repo/rauenzi/BetterDiscordApp/gh-pages/assets/emotedata_ffz.json`,
            variable: "FrankerFaceZ",
            oldVariable: "emotesFfz",
            getEmoteURL: (e) => `https://cdn.frankerfacez.com/emoticon/${e}/1`
        },
        BTTV: {
            url: `https://gitcdn.xyz/repo/rauenzi/BetterDiscordApp/gh-pages/assets/emotedata_bttv.json`,
            variable: "BTTV",
            oldVariable: "emotesBTTV",
            getEmoteURL: (e) => `https://cdn.betterttv.net/emote/${e}/1x`
        },
        BTTV2: {
            url: `https://gitcdn.xyz/repo/rauenzi/BetterDiscordApp/gh-pages/assets/emotedata_bttv2.json`,
            variable: "BTTV2",
            oldVariable: "emotesBTTV2",
            getEmoteURL: (e) => `https://cdn.betterttv.net/emote/${e}/1x`
        }
    };

    if (bdConfig.local) return;

    await this.getBlacklist();
    await this.loadEmoteData(emoteInfo);

    while (!BDV2.MessageComponent) await new Promise(resolve => setTimeout(resolve, 100));

    if (this.cancelEmoteRender) return;
    this.cancelEmoteRender = Utils.monkeyPatch(BDV2.MessageComponent, "default", {before: ({methodArguments}) => {
        const nodes = methodArguments[0].childrenMessageContent.props.content;
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

                    if (emoteName.length < 4 || bemotes.includes(emoteName)) continue;
                    if (!this.modifiers.includes(emoteModifier) || !settingsCookie["bda-es-8"]) emoteModifier = "";
                    if (!this.overrides.includes(emoteOverride)) emoteOverride = "";
                    else emoteModifier = emoteOverride;

                    let current = this.categories[c];
                    if (emoteOverride === "twitch") {
                        if (bdEmotes.TwitchGlobal[emoteName]) current = "TwitchGlobal";
                        else if (bdEmotes.TwitchSubscriber[emoteName]) current = "TwitchSubscriber";
                    }
                    else if (emoteOverride === "bttv") {
                        if (bdEmotes.BTTV[emoteName]) current = "BTTV";
                        else if (bdEmotes.BTTV2[emoteName]) current = "BTTV2";
                    }
                    else if (emoteOverride === "ffz") {
                        if (bdEmotes.FrankerFaceZ[emoteName]) current = "FrankerFaceZ";
                    }

                    if (!bdEmotes[current][emoteName] || !settingsCookie[bdEmoteSettingIDs[current]]) continue;
                    const results = nodes[n].match(new RegExp(`([\\s]|^)${Utils.escape(emoteModifier ? emoteName + ":" + emoteModifier : emoteName)}([\\s]|$)`));
                    if (!results) continue;
                    const pre = nodes[n].substring(0, results.index + results[1].length);
                    const post = nodes[n].substring(results.index + results[0].length - results[2].length);
                    nodes[n] = pre;
                    const emoteComponent = BDV2.react.createElement(BDEmote, {name: emoteName, url: bdEmotes[current][emoteName], modifier: emoteModifier});
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
};

EmoteModule.prototype.disable = function() {
    if (this.cancelEmoteRender) return;
    this.cancelEmoteRender();
    this.cancelEmoteRender = null;
};

EmoteModule.prototype.clearEmoteData = async function() {
    const _fs = require("fs");
    const emoteFile = "emote_data.json";
    const file = bdConfig.dataPath + emoteFile;
    const exists = _fs.existsSync(file);
    if (exists) _fs.unlinkSync(file);
    DataStore.setBDData("emoteCacheDate", (new Date()).toJSON());

    Object.assign(bdEmotes, {
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
    const fs = require("fs");
    const emoteFile = "emote_data.json";
    const file = bdConfig.dataPath + emoteFile;
    const exists = await new Promise(r => fs.exists(file, r));

    if (exists && this.isCacheValid()) {
        if (settingsCookie["fork-ps-2"]) Utils.showToast("Loading emotes from cache.", {type: "info"});
        Utils.log("Emotes", "Loading emotes from local cache.");

        const data = await new Promise(resolve => {
            fs.readFile(file, "utf8", (err, data) => {
                Utils.log("Emotes", "Emote file read.");
                if (err) data = {};
                resolve(data);
            });
        });

        const parsed = Utils.testJSON(data);
        let isValid = !!parsed;
        if (isValid) Object.assign(bdEmotes, parsed);

        for (const e in emoteInfo) {
            isValid = Object.keys(bdEmotes[emoteInfo[e].variable]).length > 0;
        }

        if (isValid) {
            if (settingsCookie["fork-ps-2"]) Utils.showToast("Emotes successfully loaded.", {type: "success"});
            return;
        }

        Utils.log("Emotes", "Cache was corrupt, downloading...");
        await new Promise(r => fs.unlink(file, r));
    }

    if (!settingsCookie["fork-es-3"]) return;
    if (settingsCookie["fork-ps-2"]) Utils.showToast("Downloading emotes in the background do not reload.", {type: "info"});

    for (const e in emoteInfo) {
        await new Promise(r => setTimeout(r, 1000));
        const data = await this.downloadEmotes(emoteInfo[e]);
        bdEmotes[emoteInfo[e].variable] = data;
    }

    if (settingsCookie["fork-ps-2"]) Utils.showToast("All emotes successfully downloaded.", {type: "success"});

    try { await new Promise(r => fs.writeFile(file, JSON.stringify(bdEmotes), "utf8", r)); }
    catch (err) { Utils.err("Emotes", "Could not save emote data.", err); }
};

EmoteModule.prototype.downloadEmotes = function(emoteMeta) {
    const request = require("request");
    const options = {
        url: emoteMeta.url,
        timeout: emoteMeta.timeout ? emoteMeta.timeout : 5000,
        json: true
    };

    Utils.log("Emotes", `Downloading: ${emoteMeta.variable} (${emoteMeta.url})`);

    return new Promise((resolve, reject) => {
        request(options, (error, response, parsedData) => {
            if (error) {
                Utils.err("Emotes", "Could not download " + emoteMeta.variable, error);
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
                if (emote.length < 4 || bemotes.includes(emote)) {
                    delete parsedData[emote];
                    continue;
                }
                parsedData[emote] = emoteMeta.getEmoteURL(parsedData[emote]);
            }
            resolve(parsedData);
            Utils.log("Emotes", "Downloaded: " + emoteMeta.variable);
        });
    });
};

EmoteModule.prototype.getBlacklist = function () {
    return new Promise(resolve => {
        require("request").get({url: "https://gitcdn.xyz/repo/rauenzi/BetterDiscordApp/gh-pages/assets/emotefilter.json", json: true}, function (err, resp, data) {
            if (err) return resolve(bemotes);
            resolve(bemotes.splice(0, 0, ...data.blacklist));
        });
    });
};

export default new EmoteModule();