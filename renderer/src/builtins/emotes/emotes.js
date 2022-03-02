import Builtin from "../../structs/builtin";

import {EmoteConfig, Config} from "data";
import {Utilities, WebpackModules, DataStore, DiscordModules, Events, Settings, Strings} from "modules";
import BDEmote from "../../ui/emote";
import Modals from "../../ui/modals";
import Toasts from "../../ui/toasts";
import FormattableString from "../../structs/string";
const request = require("request");
const path = require("path");
const fs = require("fs");

const EmoteURLs = {
    TwitchGlobal: new FormattableString(`https://static-cdn.jtvnw.net/emoticons/v1/{{id}}/1.0`),
    TwitchSubscriber: new FormattableString(`https://static-cdn.jtvnw.net/emoticons/v1/{{id}}/1.0`),
    FrankerFaceZ: new FormattableString(`https://cdn.frankerfacez.com/emoticon/{{id}}/1`),
    BTTV: new FormattableString(`https://cdn.betterttv.net/emote/{{id}}/1x`),
};

const Emotes = {
    TwitchGlobal: {},
    TwitchSubscriber: {},
    BTTV: {},
    FrankerFaceZ: {}
};

const Overrides = {
    twitch: 'TwitchGlobal',
    subscriber: 'TwitchSubscriber',
    bttv: 'BTTV',
    ffz: 'FFZ',
};

const blocklist = [];
const modifiers = ["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"];

 export default new class EmoteModule extends Builtin {
    get name() {return "Emotes";}
    get collection() {return "settings";}
    get category() {return "general";}
    get id() {return "emotes";}
    get categories() {return Object.keys(Emotes).filter(k => this.isCategoryEnabled(k));}
    get shouldDownload() {return Settings.get("emotes", this.category, "download");}
    get asarPath() {return path.join(DataStore.baseFolder, "emotes.asar");}

    isCategoryEnabled(id) {return super.get("emotes", "categories", id.toLowerCase());}

    get(id) {return super.get("emotes", "general", id);}

    get MessageComponent() {return WebpackModules.find(m => m.default && m.default.toString().search("childrenRepliedMessage") > -1);}

    get Emotes() {return Emotes;}
    get TwitchGlobal() {return Emotes.TwitchGlobal;}
    get TwitchSubscriber() {return Emotes.TwitchSubscriber;}
    get BTTV() {return Emotes.BTTV;}
    get FrankerFaceZ() {return Emotes.FrankerFaceZ;}
    get blocklist() {return blocklist;}
    get favorites() {return this.favoriteEmotes;}
    getUrl(category, name) {return EmoteURLs[category].format({id: Emotes[category][name]});}

    getCategory(category) {return Emotes[category];}
    getRemoteFile(category) {return Utilities.repoUrl(`assets/emotes/${category.toLowerCase()}.json`);}

    initialize() {
        super.initialize();
        const storedFavorites = DataStore.getBDData("favoriteEmotes");
        this.favoriteEmotes = storedFavorites || {};
        this.addFavorite = this.addFavorite.bind(this);
        this.removeFavorite = this.removeFavorite.bind(this);
        this.onCategoryToggle = this.onCategoryToggle.bind(this);
        this.resetEmotes = this.resetEmotes.bind(this);
    }

    async enabled() {
        Settings.registerCollection("emotes", "Emotes", EmoteConfig, {title: Strings.Emotes.clearEmotes, onClick: this.resetEmotes.bind(this)});
        // await this.getBlocklist();
        await this.loadEmoteData();

        Events.on("emotes-favorite-added", this.addFavorite);
        Events.on("emotes-favorite-removed", this.removeFavorite);
        Events.on("setting-updated", this.onCategoryToggle);
        this.patchMessageContent();
    }

    disabled() {
        Events.off("setting-updated", this.onCategoryToggle);
        Events.off("emotes-favorite-added", this.addFavorite);
        Events.off("emotes-favorite-removed", this.removeFavorite);
        Settings.removeCollection("emotes");
        this.emptyEmotes();
        if (!this.cancelEmoteRender) return;
        this.cancelEmoteRender();
        delete this.cancelEmoteRender;
    }

    onCategoryToggle(collection, cat, category, enabled) {
        if (collection != "emotes" || cat != "categories") return;
        if (enabled) return this.loadEmoteData(category);
        return this.unloadEmoteData(category);
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
        DataStore.setBDData("favoriteEmotes", this.favoriteEmotes);
    }

    emptyEmotes() {
        for (const cat in Emotes) Object.assign(Emotes, {[cat]: {}});
    }

    patchMessageContent() {
        if (this.cancelEmoteRender) return;

        const STATE_NORMAL = 0;
        const STATE_OVERRIDE = 1;
        const STATE_MODIFIER = 2;

        this.cancelEmoteRender = this.before(this.MessageComponent, "default", (thisObj, args) => {
            const nodes = args[0].childrenMessageContent.props.content;

            if (!nodes || !nodes.length) return;

            for (let n = 0; n < nodes.length; n++) {
                const node = nodes[n];
        
                if (typeof(node) !== "string") continue;
        
                let idx = 0;
                let len = node.length;
            
                while (idx < len) {
                    const start_idx = idx;
                    let state = STATE_NORMAL;
            
                    let name = "";
                    let override = "";
                    let modifier = "";
            
                    let mismatch = false;
            
                    while (idx < len) {
                        const char = node[idx];
            
                        if (isWhitespace(char)) break;
            
                        if (char === ":") {
                            // Kappa:foo:bar:baz
                            //              ^
                            if (state >= STATE_MODIFIER) {
                                mismatch = true;
                                break;
                            }
            
                            state++;
                            idx++;
                            continue;
                        }
            
                        if (state === STATE_NORMAL) name += char;
                        else if (state === STATE_OVERRIDE) override += char;
                        else if (state === STATE_MODIFIER) modifier += char;
            
                        idx++;
                    }
            
                    if (mismatch) {
                        // eat through non-whitespace
                        while (idx < len && !isWhitespace(node[idx])) idx++;
                    }
            
                    // eat through whitespace
                    while (idx < len && isWhitespace(node[idx])) idx++;
            
                    if (mismatch || name.length < 4 || blocklist.includes(name)) continue;

                    let category = Overrides[override];
            
                    if (!category) {
                        modifier = override;
            
                        // go through each source and see if we can find a match
                        for (let source in Emotes) {
                            const emotes = Emotes[source];
            
                            if (name in emotes) {
                                category = source;
                                break;
                            }
                        }
            
                        if (!category) continue;
                    } else if (!(name in Emotes[category])) {
                        continue;
                    }
            
                    if (!modifier || !modifiers.includes(modifier)) {
                        modifier = null;
                    }
        
                    const pre = node.substring(0, start_idx);
                    const post = node.substring(idx);
        
                    const el = DiscordModules.React.createElement(BDEmote, {
                        url: EmoteURLs[category].format({id: Emotes[category][name]}),
                        isFavorite: this.isFavorite(name),
                        name,
                        modifier,
                    });
        
                    nodes[n] = pre;
                    nodes.splice(n + 1, 0, el, post);
                    break;
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
    }

    async loadEmoteData(categories) {
        if (!categories) categories = this.categories;
        if (!Array.isArray(categories)) categories = [categories];
        const all = Object.keys(Emotes);
        categories = categories.map(k => all.find(c => c.toLowerCase() == k.toLowerCase()));
        Toasts.show(Strings.Emotes.loading, {type: "info"});
        this.emotesLoaded = false;
        const localOutdated = Config.release.tag_name > DataStore.getBDData("emoteVersion");

        if (!fs.existsSync(this.asarPath) || (localOutdated && this.shouldDownload)) await this.downloadEmotes();

        try {
            for (const category of categories) {
                this.log(category);
                const EmoteData = __non_webpack_require__(path.join(this.asarPath, category.toLowerCase()));
                Object.assign(Emotes[category], EmoteData);
                delete __non_webpack_require__.cache[path.join(this.asarPath, category.toLowerCase())];
                await new Promise(r => setTimeout(r, 1000));
            }

            const EmoteData = __non_webpack_require__(path.join(this.asarPath, "blocklist"));
            blocklist.push(...EmoteData);
            delete __non_webpack_require__.cache[path.join(this.asarPath, "blocklist")];
        }
        catch (err) {
            this.log("Failed to load emotes.");
        }

        this.emotesLoaded = true;
        Events.dispatch("emotes-loaded");
        Toasts.show(Strings.Emotes.loaded, {type: "success"});
    }

    unloadEmoteData(categories) {
        if (!categories) categories = this.categories;
        if (!Array.isArray(categories)) categories = [categories];
        const all = Object.keys(Emotes);
        categories = categories.map(k => all.find(c => c.toLowerCase() == k.toLowerCase()));
        for (const category of categories) {
            delete Emotes[category];
            Emotes[category] = {};
        }
    }

    async downloadEmotes() {
        try {
            const asar = Config.release.assets.find(a => a.name === "emotes.asar");
            this.log(`Downloading emotes from: ${asar.url}`);
            const buff = await new Promise((resolve, reject) =>
                request(asar.url, {encoding: null, headers: {"User-Agent": "BetterDiscord Emotes", "Accept": "application/octet-stream"}}, (err, resp, body) => {
                if (err || resp.statusCode != 200) return reject(err || `${resp.statusCode} ${resp.statusMessage}`);
                return resolve(body);
            }));

            this.log("Successfully downloaded emotes.asar");
            const asarPath = this.asarPath;
            const originalFs = require("original-fs");
            originalFs.writeFileSync(asarPath, buff);
            this.log(`Saved emotes.asar to ${asarPath}`);
            DataStore.setBDData("emoteVersion", Config.release.tag_name);
        }
        catch (err) {
            this.stacktrace("Failed to download emotes.", err);
            Modals.showConfirmationModal(Strings.Emotes.downloadFailed, Strings.Emotes.failureMessage, {cancelText: null});
        }
    }

    resetEmotes() {
        this.unloadEmoteData();
        DataStore.setBDData("emoteVersion", "0");
        this.loadEmoteData();
    }
};

function isWhitespace (char) {
    return char === " " || char === "\n"
}
