import {WebpackModules} from "modules";

const SortedGuildStore = WebpackModules.getByProps("getSortedGuilds");
const AvatarDefaults = WebpackModules.getByProps("getUserAvatarURL", "DEFAULT_AVATARS");
const InviteActions = WebpackModules.getByProps("acceptInvite");

const BrowserWindow = require("electron").remote.BrowserWindow;


export default class PublicServersConnection {

    static get endPoint() {return "https://search.discordservers.com";}
    static get joinEndPoint() {return "https://j.discordservers.com";}
    static get connectEndPoint() {return "https://auth.discordservers.com/info";}

    static getDefaultAvatar() {
        return AvatarDefaults.DEFAULT_AVATARS[Math.floor(Math.random() * 5)];
    }

    static hasJoined(id) {
        return SortedGuildStore.getFlattenedGuildIds().includes(id);
    }

    static search({term = "", keyword = "", from = 0} = {}) {
        const request = require("request");
        return new Promise(resolve => {
            const queries = [];
            if (keyword) queries.push(`keyword=${keyword.replace(/ /g, "%20").toLowerCase()}`);
            if (term) queries.push(`term=${term.replace(/ /g, "%20")}`);
            if (from) queries.push(`from=${from}`);
            const query = `?${queries.join("&")}`;
            request.get({url: `${this.endPoint}${query}${query ? "&schema=new" : "?schema=new"}`, json: true}, (err, resp, data) => {
                if (err) return resolve(null);
                const next = data.size + data.from;
                resolve({
                    servers: data.results,
                    size: data.size,
                    from: data.from,
                    total: data.total,
                    next: next >= data.total ? null : next
                });
            });
        });
    }

    static async join(id, native = false) {
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
        catch (e) {
            return false;
        }
    }

    static async checkConnection() {
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
            return false;
        }
    }

    static async getDashboard() {
        try {
            const response = await fetch(`${this.endPoint}/dashboard`, {
                method: "GET"
            });
            const data = await response.json();
            return data;
        }
        catch (error) {
            return false;
        }
    }

    static connect() {
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

    static get windowOptions() {
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

}
