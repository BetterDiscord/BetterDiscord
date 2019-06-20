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
        return SortedGuildStore.guildPositions.includes(id);
    }

    static search({term = "", category = "All", from = 0} = {}) {
        return new Promise(resolve => {
            const query = `?category=${category}&from=${from}${term ? `&term=${term}` : ""}`;
            $.ajax({
                method: "GET",
                url: `${this.endPoint}${query}`,
                success: data => {
                    const next = data.size + data.from;
                    resolve({
                        servers: data.results,
                        size: data.size,
                        from: data.from,
                        total: data.total,
                        next: next >= data.total ? null : next
                    });
                },
                error: resolve(null)
            });
        });
    }

    static join(id, native = false) {
        return new Promise(resolve => {
            if (native) return InviteActions.acceptInvite(id), resolve(true);
            $.ajax({
                method: "GET",
                url: `${this.joinEndPoint}/${id}`,
                headers: {
                    "Accept": "application/json;",
                    "Content-Type": "application/json;" ,
                    "x-discord-token": this._accessToken
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: () => resolve(true),
                error: () => resolve(false)
            });
        });
    }

    static checkConnection() {
        return new Promise(resolve => {
            try {
                $.ajax({
                    method: "GET",
                    url: this.connectEndPoint,
                    headers: {
                        "Accept": "application/json;",
                        "Content-Type": "application/json;"
                    },
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: data => {
                        this._accessToken = data.accessToken;
                        console.log(this._accessToken);
                        resolve(data);
                    },
                    error: () => resolve(false)
                });
            }
            catch (error) {
                resolve(false);
            }
        });
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
            width: 500,
            height: 550,
            backgroundColor: "#282b30",
            show: true,
            resizable: false,
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
