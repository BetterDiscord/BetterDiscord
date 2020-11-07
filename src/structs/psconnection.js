import {Logger, WebpackModules} from "modules";

const SortedGuildStore = WebpackModules.getByProps("getSortedGuilds");
const AvatarDefaults = WebpackModules.getByProps("getUserAvatarURL", "DEFAULT_AVATARS");
const InviteActions = WebpackModules.getByProps("acceptInvite");

const BrowserWindow = require("electron").remote.BrowserWindow;

const betterDiscordServer = {
    name: "BetterDiscord",
    members: 55000,
    categories: ["community", "programming", "support"],
    description: "Official BetterDiscord server for plugins, themes, support, etc",
    identifier: "86004744966914048",
    iconUrl: "https://cdn.discordapp.com/icons/86004744966914048/292e7f6bfff2b71dfd13e508a859aedd.webp",
    nativejoin: true,
    invite_code: "BJD2yvJ",
    pinned: true,
    insertDate: 1517806800
};

const ITEMS_PER_PAGE = 50;

export default new class PublicServersConnection {

    constructor() {
        this.cache = new Map();
        this.cache.set("featured", [betterDiscordServer]);
        this.cache.set("popular", []);
        this.cache.set("keywords", []);
        this.cache.set("accessToken", "");

        window.debugPS = this;
    }

    get endPoint() {return "https://search.discordservers.com";}
    get joinEndPoint() {return "https://j.discordservers.com";}
    get connectEndPoint() {return "https://auth.discordservers.com/info";}

    getDefaultAvatar() {
        return AvatarDefaults.DEFAULT_AVATARS[Math.floor(Math.random() * 5)];
    }

    hasJoined(id) {
        return SortedGuildStore.getFlattenedGuildIds().includes(id);
    }

    async search({term = "", keyword = "", page = 1} = {}) {
        if (this.cache.has(term + keyword + page)) return this.cache.get(term + keyword + page);

        const from = (page - 1) * ITEMS_PER_PAGE;
        const queries = [];
        if (keyword) queries.push(`keyword=${keyword.replace(/ /g, "%20").toLowerCase()}`);
        if (term) queries.push(`term=${term.replace(/ /g, "%20")}`);
        if (from) queries.push(`from=${from}`);
        const query = `?${queries.join("&")}`;
        
        try {
            const response = await fetch(`${this.endPoint}${query}`, {method: "GET"});
            const data = await response.json();
            const results = {
                servers: data.results,
                size: data.size,
                total: data.total,
                page: Math.ceil(from / ITEMS_PER_PAGE) + 1,
                numPages: Math.ceil(data.total / ITEMS_PER_PAGE)
            };
            this.cache.set(term + keyword + page, results);
            return results;
        }
        catch (error) {
            Logger.stacktrace("PublicServers", "Could not reach search endpoint.", error);
        }
    }

    async getDashboard() {
        const cachedKeywords = this.cache.get("keywords");
        if (cachedKeywords && cachedKeywords.length) return {featured: this.cache.get("featured"), popular: this.cache.get("popular"), keywords: cachedKeywords};
        try {
            const response = await fetch(`${this.endPoint}/dashboard`, {method: "GET"});
            const data = await response.json();

            const featuredFirst = data.results[0].key === "featured";
            const featuredServers = data.results[featuredFirst ? 0 : 1].response.hits;
            const popularServers = data.results[featuredFirst ? 1 : 0].response.hits;
            const mainKeywords = data.mainKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).sort();

            featuredServers.unshift(betterDiscordServer);
            
            this.cache.set("featured", featuredServers);
            this.cache.set("popular", popularServers);
            this.cache.set("keywords", mainKeywords);
            return {featured: this.cache.get("featured"), popular: this.cache.get("popular"), keywords: this.cache.get("keywords")};
        }
        catch (error) {
            Logger.stacktrace("PublicServers", "Could not download dashboard.", error);
            return {featured: this.cache.get("featured"), popular: this.cache.get("popular"), keywords: this.cache.get("keywords")};
        }
    }

    async join(id, native = false) {
        if (native) return InviteActions.acceptInvite(id);
        try {
            await fetch(`${this.joinEndPoint}/${id}`,{
                method: "GET",
                credentials: "include",
                mode: "cors",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
            return true;
        }
        catch (error) {
            Logger.warn("PublicServers", "Could not join server.");
            return false;
        }
    }

    async checkConnection() {
        try {
            const response = await fetch(this.connectEndPoint, {
                method: "GET",
                credentials: "include",
                mode: "cors",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            this._accessToken = data.access_token;
            return data;
        }
        catch (error) {
            Logger.warn("PublicServers", "Could not verify connection.");
            return false;
        }
    }

    connect() {
        return new Promise(resolve => {
            const joinWindow = new BrowserWindow(this.windowOptions);
            const url = `https://auth.discordservers.com/connect?scopes=guilds.join&previousUrl=${this.connectEndPoint}`;
            joinWindow.webContents.on("did-navigate", (event, navUrl) => {
                if (navUrl != this.connectEndPoint) return;
                joinWindow.close();
                resolve();
            });
            joinWindow.loadURL(url);
        });
    }

    get windowOptions() {
        return {
            width: 490,
            height: 500,
            backgroundColor: "#282b30",
            show: true,
            resizable: true,
            maximizable: false,
            minimizable: false,
            alwaysOnTop: true,
            frame: false,
            center: true,
            webPreferences: {
                nodeIntegration: false
            }
        };
    }
};
