import BDV2 from "../../modules/v2";

import Tools from "../tools";
import SettingsTitle from "../settingsTitle";
import TabBarSeparator from "../tabBarSeparator";
import TabBarHeader from "../tabBarHeader";
import TabBarItem from "../tabBarItem";

import ServerCard from "./serverCard";
import SidebarView from "./sidebarView";

export default class V2C_PublicServers extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.close = this.close.bind(this);
        this.changeCategory = this.changeCategory.bind(this);
        this.search = this.search.bind(this);
        this.searchKeyDown = this.searchKeyDown.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.join = this.join.bind(this);
        this.connect = this.connect.bind(this);

        this.GuildStore = BDV2.WebpackModules.findByUniqueProperties(["getGuilds"]);
        this.AvatarDefaults = BDV2.WebpackModules.findByUniqueProperties(["getUserAvatarURL", "DEFAULT_AVATARS"]);
        this.InviteActions = BDV2.WebpackModules.findByUniqueProperties(["acceptInvite"]);
        this.SortedGuildStore = BDV2.WebpackModules.findByUniqueProperties(["getSortedGuilds"]);
    }

    componentDidMount() {
        this.checkConnection();
     }

    setInitialState() {
        this.state = {
            selectedCategory: -1,
            title: "Loading...",
            loading: true,
            servers: [],
            next: null,
            connection: {
                state: 0,
                user: null
            }
        };
    }

    close() {
        BDV2.reactDom.unmountComponentAtNode(document.getElementById(this.props.rootId));
    }

    search(query, clear) {
        const self = this;
        const request = require("request");
        request.get({url: `${self.endPoint}${query}${query ? "&schema=new" : "?schema=new"}`, json: true}, function (err, resp, data) {
            if (err) {
                return self.setState({
                    loading: false,
                    title: "Failed to load servers. Check console for details"
                });
            }
            let servers = data.results.reduce((arr, server) => {
                server.joined = false;
                arr.push(server);
                // arr.push(<ServerCard server={server} join={self.join}/>);
                return arr;
            }, []);

            if (!clear) {
                servers = self.state.servers.concat(servers);
            }
            else {
                //servers.unshift(self.bdServer);
            }

            let end = data.size + data.from;
            data.next = `?from=${end}`;
            if (self.state.term) data.next += `&term=${self.state.term}`;
            if (self.state.selectedCategory) data.next += `&category=${self.categoryButtons[self.state.selectedCategory]}`;
            if (end >= data.total) {
                end = data.total;
                data.next = null;
            }

            let title = `Showing 1-${end} of ${data.total} results in ${self.categoryButtons[self.state.selectedCategory]}`;
            if (self.state.term) title += ` for ${self.state.term}`;

            self.setState({
                loading: false,
                title: title,
                servers: servers,
                next: data.next
            });

            if (clear) {
                //console.log(self);
                self.refs.sbv.refs.contentScroller.scrollTop = 0;
            }
        });
    }

    async join(serverCard) {
        if (serverCard.props.pinned) return this.InviteActions.acceptInvite(serverCard.props.invite_code);

        await fetch(`${this.joinEndPoint}/${serverCard.props.server.identifier}`,{
            method: "GET",
            credentials: "include",
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        serverCard.setState({joined: true});
    }

    connect() {
        const self = this;
        const options = self.windowOptions;
        options.x = Math.round(window.screenX + window.innerWidth / 2 - options.width / 2);
        options.y = Math.round(window.screenY + window.innerHeight / 2 - options.height / 2);

        self.joinWindow = new (window.require("electron").remote.BrowserWindow)(options);
        const url = "https://auth.discordservers.com/connect?scopes=guilds.join&previousUrl=https://auth.discordservers.com/info";
        self.joinWindow.webContents.on("did-navigate", (event, url) => {
            if (url != "https://auth.discordservers.com/info") return;
            self.joinWindow.close();
            self.checkConnection();
        });
        self.joinWindow.loadURL(url);
    }

    get windowOptions() {
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
            center: false,
            webPreferences: {
                nodeIntegration: false
            }
        };
    }

    get bdServer() {
        const server = {
            name: "BetterDiscord",
            online: "7500+",
            members: "20000+",
            categories: ["community", "programming", "support"],
            description: "Official BetterDiscord server for support etc",
            identifier: "86004744966914048",
            iconUrl: "https://cdn.discordapp.com/icons/86004744966914048/292e7f6bfff2b71dfd13e508a859aedd.webp",
            nativejoin: true,
            invite_code: "0Tmfo5ZbORCRqbAd",
            pinned: true
        };
        const guildList = this.SortedGuildStore.getFlattenedGuildIds();
        const defaultList = this.AvatarDefaults.DEFAULT_AVATARS;
        return BDV2.react.createElement(ServerCard, {server: server, pinned: true, join: this.join, guildList: guildList, fallback: defaultList[Math.floor(Math.random() * 5)]});
    }

    get endPoint() {
        return "https://search.discordservers.com";
    }

    get joinEndPoint() {
        return "https://j.discordservers.com";
    }

    get connectEndPoint() {
        return "https://join.discordservers.com/connect";
    }

    async checkConnection() {
        const self = this;
        try {
            const response = await fetch(`https://auth.discordservers.com/info`,{
                method: "GET",
                credentials: "include",
                mode: "cors",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            self.setState({
                selectedCategory: 0,
                connection: {
                    state: 2,
                    user: data
                }
            });
            self.search("", true);
        }
        catch (error) {
            self.setState({
                title: "Not connected to discordservers.com!",
                loading: true,
                selectedCategory: -1,
                connection: {
                    state: 1,
                    user: null
                }
            });
        }
    }

    render() {
        return BDV2.react.createElement(SidebarView, {ref: "sbv"}, this.component);
    }

    get component() {
        return {
            sidebar: {
                component: this.sidebar
            },
            content: {
                component: this.content
            },
            tools: {
                component: BDV2.react.createElement(Tools, {key: "pt", ref: "tools", onClick: this.close})
            }
        };
    }

    get sidebar() {
        return BDV2.react.createElement(
            "div",
            {className: "sidebar", key: "ps"},
            BDV2.react.createElement(
                "div",
                {className: "ui-tab-bar SIDE"},
                BDV2.react.createElement(
                    "div",
                    {className: "ui-tab-bar-header", style: {fontSize: "16px"}},
                    "Public Servers"
                ),
                BDV2.react.createElement(TabBarSeparator, null),
                this.searchInput,
                BDV2.react.createElement(TabBarSeparator, null),
                BDV2.react.createElement(TabBarHeader, {text: "Categories"}),
                this.categoryButtons.map((value, index) => {
                    return BDV2.react.createElement(TabBarItem, {id: index, onClick: this.changeCategory, key: index, text: value, selected: this.state.selectedCategory === index});
                }),
                BDV2.react.createElement(TabBarSeparator, null),
                this.footer,
                this.connection
            )
        );
    }

    get searchInput() {
        return BDV2.react.createElement(
            "div",
            {className: "ui-form-item"},
            BDV2.react.createElement(
                "div",
                {className: "ui-text-input flex-vertical", style: {width: "172px", marginLeft: "10px"}},
                BDV2.react.createElement("input", {ref: "searchinput", onKeyDown: this.searchKeyDown, onChange: () => {}, type: "text", className: "input default", placeholder: "Search...", maxLength: "50"})
            )
        );
    }

    searchKeyDown(e) {
        const self = this;
        if (self.state.loading || e.which !== 13) return;
        self.setState({
            loading: true,
            title: "Loading...",
            term: e.target.value
        });
        let query = `?term=${e.target.value}`;
        if (self.state.selectedCategory !== 0) {
            query += `&category=${self.categoryButtons[self.state.selectedCategory]}`;
        }
        self.search(query, true);
    }

    get categoryButtons() {
        return ["All", "FPS Games", "MMO Games", "Strategy Games", "MOBA Games", "RPG Games", "Tabletop Games", "Sandbox Games", "Simulation Games", "Music", "Community", "Language", "Programming", "Other"];
    }

    changeCategory(id) {
        const self = this;
        if (self.state.loading) return;
        self.refs.searchinput.value = "";
        self.setState({
            loading: true,
            selectedCategory: id,
            title: "Loading...",
            term: null
        });
        if (id === 0) {
            self.search("", true);
            return;
        }
        self.search(`?category=${self.categoryButtons[id]}`, true);
    }

    get content() {
        const self = this;
        const guildList = this.SortedGuildStore.getFlattenedGuildIds();
        const defaultList = this.AvatarDefaults.DEFAULT_AVATARS;
        if (self.state.connection.state === 1) return self.notConnected;
        return [BDV2.react.createElement(
            "div",
            {ref: "content", key: "pc", className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(SettingsTitle, {text: self.state.title}),
            self.bdServer,
            self.state.servers.map((server) => {
                return BDV2.react.createElement(ServerCard, {key: server.identifier, server: server, join: self.join, guildList: guildList, fallback: defaultList[Math.floor(Math.random() * 5)]});
            }),
            self.state.next && BDV2.react.createElement(
                "button",
                {type: "button", onClick: () => {
                        if (self.state.loading) return;self.setState({loading: true}); self.search(self.state.next, false);
                    }, className: "ui-button filled brand small grow", style: {width: "100%", marginTop: "10px", marginBottom: "10px"}},
                BDV2.react.createElement(
                    "div",
                    {className: "ui-button-contents"},
                    self.state.loading ? "Loading" : "Load More"
                )
            ),
            self.state.servers.length > 0 && BDV2.react.createElement(SettingsTitle, {text: self.state.title})
        )];
    }

    get notConnected() {
        const self = this;
        //return BDV2.react.createElement(SettingsTitle, { text: self.state.title });
        return [BDV2.react.createElement(
            "div",
            {key: "ncc", ref: "content", className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(
                "h2",
                {className: "ui-form-title h2 margin-reset margin-bottom-20"},
                "Not connected to discordservers.com!",
                BDV2.react.createElement(
                    "button",
                    {
                        onClick: self.connect,
                        type: "button",
                        className: "ui-button filled brand small grow",
                        style: {
                            display: "inline-block",
                            minHeight: "18px",
                            marginLeft: "10px",
                            lineHeight: "14px"
                        }
                    },
                    BDV2.react.createElement(
                        "div",
                        {className: "ui-button-contents"},
                        "Connect"
                    )
                )
            ), self.bdServer
        )];
    }

    get footer() {
        return BDV2.react.createElement(
            "div",
            {className: "ui-tab-bar-header"},
            BDV2.react.createElement(
                "a",
                {href: "https://discordservers.com", target: "_blank"},
                "Discordservers.com"
            )
        );
    }

    get connection() {
        const self = this;
        const {connection} = self.state;
        if (connection.state !== 2) return BDV2.react.createElement("span", null);

        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(TabBarSeparator, null),
            BDV2.react.createElement(
                "span",
                {style: {color: "#b9bbbe", fontSize: "10px", marginLeft: "10px"}},
                "Connected as: ",
                `${connection.user.username}#${connection.user.discriminator}`
            ),
            BDV2.react.createElement(
                "div",
                {style: {padding: "5px 10px 0 10px"}},
                BDV2.react.createElement(
                    "button",
                    {style: {width: "100%", minHeight: "20px"}, type: "button", className: "ui-button filled brand small grow"},
                    BDV2.react.createElement(
                        "div",
                        {className: "ui-button-contents", onClick: self.connect},
                        "Reconnect"
                    )
                )
            )
        );
}
}