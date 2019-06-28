import Builtin from "../structs/builtin";

import {Config, EmoteConfig} from "data";
import {Utilities, WebpackModules, DataStore, DiscordModules, Events, Settings, Strings} from "modules";
import BDEmote from "../ui/emote";
import Toasts from "../ui/toasts";
import FormattableString from "../structs/string";
const request = require("request");
// const fs = require("fs");

const EmoteURLs = {
    TwitchGlobal: new FormattableString(`https://static-cdn.jtvnw.net/emoticons/v1/{{id}}/1.0`),
    TwitchSubscriber: new FormattableString(`https://static-cdn.jtvnw.net/emoticons/v1/{{id}}/1.0`),
    FrankerFaceZ: new FormattableString(`https://cdn.frankerfacez.com/emoticon/{{id}}/1`),
    BTTV: new FormattableString(`https://cdn.betterttv.net/emote/{{id}}/1x`),
    BTTV2: new FormattableString(`https://cdn.betterttv.net/emote/{{id}}/1x`)
};

const EmoteMetaInfo = {
    TwitchGlobal: {},
    TwitchSubscriber: {},
    BTTV: {},
    FrankerFaceZ: {},
    BTTV2: {}
};

const Emotes = {
    TwitchGlobal: {},
    TwitchSubscriber: {},
    BTTV: {},
    FrankerFaceZ: {},
    BTTV2: {}
};

const bdEmoteSettingIDs = {
    TwitchGlobal: "twitch",
    TwitchSubscriber: "twitch",
    BTTV: "bttv",
    FrankerFaceZ: "ffz",
    BTTV2: "bttv"
};

const blacklist = [];
const overrides = ["twitch", "bttv", "ffz"];
const modifiers = ["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"];

export default new class EmoteModule extends Builtin {
    get name() {return "Emotes";}
    get collection() {return "settings";}
    get category() {return "general";}
    get id() {return "emotes";}
    get categories() {return Object.keys(bdEmoteSettingIDs).filter(k => this.isCategoryEnabled(bdEmoteSettingIDs[k]));}
    get shouldDownload() {return Settings.get("emotes", this.category, "download");}

    isCategoryEnabled(id) {return super.get("emotes", "categories", id);}

    get(id) {return super.get("emotes", "general", id);}

    get MessageContentComponent() {return WebpackModules.getModule(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));}

    get Emotes() {return Emotes;}
    get TwitchGlobal() {return Emotes.TwitchGlobal;}
    get TwitchSubscriber() {return Emotes.TwitchSubscriber;}
    get BTTV() {return Emotes.BTTV;}
    get FrankerFaceZ() {return Emotes.FrankerFaceZ;}
    get BTTV2() {return Emotes.BTTV2;}
    get blacklist() {return blacklist;}
    get favorites() {return this.favoriteEmotes;}

    getCategory(category) {return Emotes[category];}
    getRemoteFile(category) {return new FormattableString(Utilities.repoUrl(`data/emotes/${category.toLowerCase()}.json`));}

    initialize() {
        super.initialize();
        this.favoriteEmotes = {};
        const fe = DataStore.getBDData("bdfavemotes");
        if (fe !== "" && fe !== null) this.favoriteEmotes = JSON.parse(window.atob(fe));
        this.saveFavorites();
        this.addFavorite = this.addFavorite.bind(this);
        this.removeFavorite = this.removeFavorite.bind(this);
        // EmoteConfig;
        // emoteCollection.button = {title: "Clear Emote Cache", onClick: () => { this.clearEmoteData(); this.loadEmoteData(EmoteInfo); }};
    }

    async enabled() {
        Settings.registerCollection("emotes", "Emotes", EmoteConfig, {title: Strings.Emotes.clearEmotes, onClick: () => {this.clearEmoteData(); this.loadEmoteData();}});
        // Disable emote module for now because it's annoying and slow
        await this.getBlacklist();
        await this.loadEmoteData();

        while (!this.MessageContentComponent) await new Promise(resolve => setTimeout(resolve, 100));
        this.patchMessageContent();
        Events.on("emotes-favorite-added", this.addFavorite);
        Events.on("emotes-favorite-removed", this.removeFavorite);
    }

    disabled() {
        Events.off("emotes-favorite-added", this.addFavorite);
        Events.off("emotes-favorite-removed", this.removeFavorite);
        Settings.removeCollection("emotes");
        this.emptyEmotes();
        if (!this.cancelEmoteRender) return;
        this.cancelEmoteRender();
        delete this.cancelEmoteRender;
    }

    addFavorite(name, url) {
        if (!this.favoriteEmotes.hasOwnProperty(name)) this.favoriteEmotes[name] = url;
        this.saveFavorites();
    }

    removeFavorite(name) {
        if (!this.favoriteEmotes.hasOwnProperty(name)) return;
        delete this.favoriteEmotes[name];
        this.saveFavorites();
    }

    isFavorite(name) {
        return this.favoriteEmotes.hasOwnProperty(name);
    }

    saveFavorites() {
        DataStore.setBDData("bdfavemotes", window.btoa(JSON.stringify(this.favoriteEmotes)));
    }

    emptyEmotes() {
        for (const cat in Emotes) Object.assign(Emotes, {[cat]: {}});
    }

    patchMessageContent() {
        if (this.cancelEmoteRender) return;
        this.cancelEmoteRender = this.after(this.MessageContentComponent.prototype, "render", (thisObj, args, retVal) => {
            this.after(retVal.props, "children", (t, a, returnValue) => {
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

                            if (emoteName.length < 4 || blacklist.includes(emoteName)) continue;
                            if (!modifiers.includes(emoteModifier) || !Settings.get(this.category, "general", "modifiers")) emoteModifier = "";
                            if (!overrides.includes(emoteOverride)) emoteOverride = "";
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

                            if (!Emotes[current][emoteName] || !Settings.get(this.category, "categories", bdEmoteSettingIDs[current])) continue;
                            const results = nodes[n].match(new RegExp(`([\\s]|^)${Utilities.escape(emoteModifier ? emoteName + ":" + emoteModifier : emoteName)}([\\s]|$)`));
                            if (!results) continue;
                            const pre = nodes[n].substring(0, results.index + results[1].length);
                            const post = nodes[n].substring(results.index + results[0].length - results[2].length);
                            nodes[n] = pre;
                            const emoteComponent = DiscordModules.React.createElement(BDEmote, {name: emoteName, url: Emotes[current][emoteName], modifier: emoteModifier, isFavorite: this.isFavorite(emoteName)});
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
            });
        });
    }

    getBlacklist() {
        return new Promise(resolve => {
            request.get({url: Utilities.repoUrl(`data/emotes/blacklist.json`), json: true}, (err, resp, data) => {
                if (err || resp.statusCode != 200) return resolve();
                resolve(blacklist.push(...data));
            });
        });
    }

    isCacheValid(category) {
        return new Promise(resolve => {
            const etag = DataStore.getCacheHash("emotes", category);
            if (!etag) return resolve(false);
            request.head({url: this.getRemoteFile(category), headers: {"If-None-Match": etag}}, (err, resp) => {
                resolve(resp.statusCode == 304);
            });
        });
    }

    async loadEmoteData() {
        this.emotesLoaded = false;

        for (const category in Emotes) {
            const exists = DataStore.emotesExist(category);
            const valid = await this.isCacheValid(category);
            const useCache = (valid) || (!valid && exists && !this.shouldDownload);
            let data = null;
            if (useCache) {
                this.log(`Loading ${category} emotes from local cache.`);
                const cachedData = DataStore.getEmoteData(category);
                const hasData = Object.keys(data).length > 0;
                if (hasData) data = cachedData;
            }
            if (!data) data = await this.downloadEmotes(category);
            Object.assign(Emotes[category], data);
        }

        // Toasts.show(Strings.Emotes.downloading, {type: "info"});
        // Toasts.show(Strings.Emotes.downloaded, {type: "success"});

        this.emotesLoaded = true;
        Events.dispatch("emotes-loaded");
    }

    downloadEmotes(category) {
        const url = this.getRemoteFile(category);
        this.log(`Downloading ${category} from ${url}`);
        const options = {url: url, timeout: 5000, json: true};
        return new Promise(resolve => {
            request.get(options, (error, response, parsedData) => {
                if (error || response.statusCode != 200) {
                    this.stacktrace(`Could not download ${category} emotes.`, error);
                    return resolve({});
                }

                for (const emote in parsedData) {
                    if (emote.length < 4 || blacklist.includes(emote) || !parsedData[emote]) {
                        delete parsedData[emote];
                        continue;
                    }
                    parsedData[emote] = EmoteURLs[category].format({id: parsedData[emote]});
                }
                DataStore.saveEmoteData(category, parsedData);
                resolve(parsedData);
                this.log(`Downloaded ${category}`);
            });
        });
    }

    clearEmoteData() {
        const _fs = require("fs");
        const emoteFile = "emote_data.json";
        const file = Config.dataPath + emoteFile;
        const exists = _fs.existsSync(file);
        if (exists) _fs.unlinkSync(file);
        DataStore.setBDData("emoteCacheDate", (new Date()).toJSON());
        for (const category in Emotes) Object.assign(Emotes, {[category]: {}});
    }
};


// (async () => {
//     const emoteData = await new Promise(resolve => {
//         const req = require("request");
//         req.get({url: "https://twitchemotes.com/api_cache/v3/global.json", json: true}, (err, resp, parsedData) => {
//             for (const emote in parsedData) {
//                 if (emote.length < 4 || window.bemotes.includes(emote)) {
//                     delete parsedData[emote];
//                     continue;
//                 }
//                 parsedData[emote] = parsedData[emote].id;
//             }
//             resolve(parsedData);
//         });
//     });
//     const fs = require("fs");
//     fs.writeFileSync("Z:\\Programming\\BetterDiscordStuff\\BetterDiscordApp\\data\\emotes\\global.json", JSON.stringify(emoteData));
//     return emoteData;
// })();