import Builtin from "../structs/builtin";

import {Config, SettingsCookie, Emotes, EmoteBlacklist, EmoteInfo, EmoteModifiers, EmoteOverrides, State} from "data";
import {Utilities, WebpackModules, DataStore, DiscordModules, Events} from "modules";
import BDEmote from "../ui/emote";
import {Toasts} from "ui";

const bdEmoteSettingIDs = {
    TwitchGlobal: "twitch",
    TwitchSubscriber: "twitch",
    BTTV: "bttv",
    FrankerFaceZ: "ffz",
    BTTV2: "bttv"
};

export default new class EmoteModule extends Builtin {
    get name() {return "Emotes";}
    get collection() {return "settings";}
    get category() {return "general";}
    get id() {return "emotes";}
    get categories() { return Object.keys(bdEmoteSettingIDs).filter(k => this.isCategoryEnabled(bdEmoteSettingIDs[k])); }

    get MessageContentComponent() {return WebpackModules.getModule(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));}

    isCategoryEnabled(id) {
        return super.get("emotes", "categories", id);
    }

    get(id) {
        return super.get("emotes", "general", id);
    }

    async enabled() {
        // Disable emote module for now because it's annoying and slow
        // await this.getBlacklist();
        // await this.loadEmoteData(EmoteInfo);

        // while (!this.MessageContentComponent) await new Promise(resolve => setTimeout(resolve, 100));
        // this.patchMessageContent();
    }

    disabled() {
        this.emptyEmotes();
        if (this.cancelEmoteRender) return;
        this.cancelEmoteRender();
        delete this.cancelEmoteRender;
    }

    emptyEmotes() {
        for (const cat in Emotes) Object.assign(Emotes, {[cat]: {}});
    }

    patchMessageContent() {
        if (this.cancelEmoteRender) return;
        this.cancelEmoteRender = Utilities.monkeyPatch(this.MessageContentComponent.prototype, "render", {after: ({returnValue}) => {
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
                            if (!EmoteModifiers.includes(emoteModifier) || !SettingsCookie["bda-es-8"]) emoteModifier = "";
                            if (!EmoteOverrides.includes(emoteOverride)) emoteOverride = "";
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
    }

    async loadEmoteData(emoteInfo) {
        const _fs = require("fs");
        const emoteFile = "emote_data.json";
        const file = Config.dataPath + emoteFile;
        const exists = _fs.existsSync(file);

        if (exists && this.isCacheValid()) {
            Toasts.show("Loading emotes from cache.", {type: "info"});
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
                Toasts.show("Emotes successfully loaded.", {type: "success"});
                State.emotesLoaded = true;
                Events.dispatch("emotes-loaded");
                return;
            }

            Utilities.log("Emotes", "Cache was corrupt, downloading...");
            _fs.unlinkSync(file);
        }

        if (!SettingsCookie["fork-es-3"]) return;
        Toasts.show("Downloading emotes in the background do not reload.", {type: "info"});

        for (const e in emoteInfo) {
            await new Promise(r => setTimeout(r, 1000));
            const data = await this.downloadEmotes(emoteInfo[e]);
            Emotes[emoteInfo[e].variable] = data;
        }

        Toasts.show("All emotes successfully downloaded.", {type: "success"});

        try { _fs.writeFileSync(file, JSON.stringify(Emotes), "utf8"); }
        catch (err) { Utilities.err("Emotes", "Could not save emote data.", err); }

        State.emotesLoaded = true;
        Events.dispatch("emotes-loaded");
    }

    downloadEmotes(emoteMeta) {
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
    }

    getBlacklist() {
        return new Promise(resolve => {
            $.getJSON(`https://rauenzi.github.io/BetterDiscordApp/data/emotefilter.json`, function (data) {
                resolve(EmoteBlacklist.push(...data.blacklist));
            });
        });
    }

    isCacheValid() {
        const cacheLength = DataStore.getBDData("emoteCacheDays") || DataStore.setBDData("emoteCacheDays", 7) || 7;
        const cacheDate = new Date(DataStore.getBDData("emoteCacheDate") || null);
        const currentDate = new Date();
        const daysBetween = Math.round(Math.abs((currentDate.getTime() - cacheDate.getTime()) / (24 * 60 * 60 * 1000)));
        if (daysBetween > cacheLength) {
            DataStore.setBDData("emoteCacheDate", currentDate.toJSON());
            return false;
        }
        return true;
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