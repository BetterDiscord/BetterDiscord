import {React, WebpackModules} from "modules";
import Tools from "./exitbutton";
import TabBar from "./tabbar";
import SettingsTitle from "../settings/title";
import ServerCard from "./card";

const AvatarDefaults = WebpackModules.getByProps("getUserAvatarURL", "DEFAULT_AVATARS");
const InviteActions = WebpackModules.getByProps("acceptInvite");
const SortedGuildStore = WebpackModules.getByProps("getSortedGuilds");
const SettingsView = WebpackModules.getByDisplayName("SettingsView");
//SettingsView
//onClose pop layer
//onSetSection dispatch user settings modal set section section subsection
//section selected one
//sections []
//theme dark

export default class PublicServers extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedCategory: "All",
            title: "Loading...",
            loading: true,
            servers: [],
            next: null,
            connection: {
                state: 0,
                user: null
            }
        };
        this.close = this.close.bind(this);
        this.changeCategory = this.changeCategory.bind(this);
        this.search = this.search.bind(this);
        this.searchKeyDown = this.searchKeyDown.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.join = this.join.bind(this);
        this.connect = this.connect.bind(this);
    }

    componentDidMount() {
        this.checkConnection();
     }

    close() {
        this.props.close();
    }

    search(query, clear) {
        $.ajax({
            method: "GET",
            url: `${this.endPoint}${query}${query ? "&schema=new" : "?schema=new"}`,
            success: data => {
                let servers = data.results.reduce((arr, server) => {
                    server.joined = false;
                    arr.push(server);
                    // arr.push(<ServerCard server={server} join={this.join}/>);
                    return arr;
                }, []);

                if (!clear) {
                    servers = this.state.servers.concat(servers);
                }
                else {
                    //servers.unshift(this.bdServer);
                }

                console.log(data);

                let end = data.size + data.from;
                data.next = `?from=${end}`;
                if (this.state.term) data.next += `&term=${this.state.term}`;
                if (this.state.selectedCategory) data.next += `&category=${this.state.selectedCategory}`;
                if (end >= data.total) {
                    end = data.total;
                    data.next = null;
                }

                let title = `Showing 1-${end} of ${data.total} results in ${this.state.selectedCategory}`;
                if (this.state.term) title += ` for ${this.state.term}`;

                this.setState({
                    loading: false,
                    title: title,
                    servers: servers,
                    next: data.next
                });

                if (clear) {
                    //console.log(this);
                    // this.refs.sbv.refs.contentScroller.scrollTop = 0;
                }
            },
            error: () => {
                this.setState({
                    loading: false,
                    title: "Failed to load servers. Check console for details"
                });
            }
        });
    }

    join(serverCard) {
        if (serverCard.props.pinned) return InviteActions.acceptInvite(serverCard.props.invite_code);
        $.ajax({
            method: "GET",
            url: `${this.joinEndPoint}/${serverCard.props.server.identifier}`,
            headers: {
                "Accept": "application/json;",
                "Content-Type": "application/json;" ,
                "x-discord-token": this.state.connection.user.accessToken
            },
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: () => {
                serverCard.setState({joined: true});
            }
        });
    }

    connect() {
        const options = this.windowOptions;
        options.x = Math.round(window.screenX + window.innerWidth / 2 - options.width / 2);
        options.y = Math.round(window.screenY + window.innerHeight / 2 - options.height / 2);

        this.joinWindow = new (window.require("electron").remote.BrowserWindow)(options);
        const url = "https://auth.discordservers.com/connect?scopes=guilds.join&previousUrl=https://auth.discordservers.com/info";
        this.joinWindow.webContents.on("did-navigate", (event, navUrl) => {
            if (navUrl != "https://auth.discordservers.com/info") return;
            this.joinWindow.close();
            this.checkConnection();
        });
        this.joinWindow.loadURL(url);
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
        const guildList = SortedGuildStore.guildPositions;
        const defaultList = AvatarDefaults.DEFAULT_AVATARS;
        return React.createElement(ServerCard, {server: server, pinned: true, join: this.join, guildList: guildList, fallback: defaultList[Math.floor(Math.random() * 5)]});
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

    checkConnection() {
        try {
            $.ajax({
                method: "GET",
                url: `https://auth.discordservers.com/info`,
                headers: {
                    "Accept": "application/json;",
                    "Content-Type": "application/json;"
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: data => {
                    // Utils.log("PublicServer", "Got data: " + JSON.stringify(data));
                    this.setState({
                        selectedCategory: "All",
                        connection: {
                            state: 2,
                            user: data
                        }
                    });
                    this.search("", true);

                },
                error: () => {
                    this.setState({
                        title: "Not connected to discordservers.com!",
                        loading: true,
                        selectedCategory: "All",
                        connection: {
                            state: 1,
                            user: null
                        }
                    });
                }
            });
        }
        catch (error) {
            this.setState({
                title: "Not connected to discordservers.com!",
                loading: true,
                selectedCategory: "All",
                connection: {
                    state: 1,
                    user: null
                }
            });
        }
    }

    //SettingsView
//onClose pop layer
//onSetSection dispatch user settings modal set section section subsection
//section selected one
//sections []
//theme dark

    render() {
        const categories = this.categoryButtons.map(name => {
            const section = {
                section: name,//.toLowerCase().replace(" ", "_"),
                label: name,
                //element: () => name == "All" ? this.content : null
            };
            
            if (name == "All") section.element = () => this.content;
            // else section.onClick = () => this.changeCategory(name);
            return section;
        });
        return React.createElement(SettingsView, {
            onClose: this.close,
            onSetSection: (e, ee, eee) => {console.log(e, ee, eee);this.changeCategory(e);},
            section: this.state.selectedCategory,
            sections: [
                {section: "HEADER", label: "Public Servers"},
                {section: "CUSTOM", element: () => this.searchInput},
                {section: "HEADER", label: "Categories"},
                ...categories
            ],
            theme: "dark"
        });
        // return React.createElement(StandardSidebarView, {id: "pubslayer", ref: "sbv", notice: null, theme: "dark", closeAction: this.close, content: this.content, sidebar: this.sidebar});
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
                component: React.createElement(Tools, {key: "pt", ref: "tools", onClick: this.close})
            }
        };
    }

    get sidebar() {
        return React.createElement(
                "div",
                {className: "ui-tab-bar SIDE"},
                React.createElement(
                    "div",
                    {className: "ui-tab-bar-header", style: {fontSize: "16px"}},
                    "Public Servers"
                ),
                React.createElement(TabBar.Separator, null),
                this.searchInput,
                React.createElement(TabBar.Separator, null),
                React.createElement(TabBar.Header, {text: "Categories"}),
                this.categoryButtons.map((value, index) => {
                    return React.createElement(TabBar.Item, {id: index, onClick: this.changeCategory, key: index, text: value, selected: this.state.selectedCategory === index});
                }),
                React.createElement(TabBar.Separator, null),
                this.footer,
                this.connection
            );
    }

    get searchInput() {
        return React.createElement(
            "div",
            {className: "ui-form-item"},
            React.createElement(
                "div",
                {className: "ui-text-input flex-vertical", style: {width: "172px", marginLeft: "10px"}},
                React.createElement("input", {onKeyDown: this.searchKeyDown, onChange: () => {}, type: "text", className: "input default", placeholder: "Search...", maxLength: "50"})
            )
        );
    }

    searchKeyDown(e) {
        if (this.state.loading || e.which !== 13) return;
        this.setState({
            loading: true,
            title: "Loading...",
            term: e.target.value
        });
        let query = `?term=${e.target.value}`;
        if (this.state.selectedCategory !== 0) {
            query += `&category=${this.state.selectedCategory}`;
        }
        this.search(query, true);
    }

    get categoryButtons() {
        return ["All", "FPS Games", "MMO Games", "Strategy Games", "MOBA Games", "RPG Games", "Tabletop Games", "Sandbox Games", "Simulation Games", "Music", "Community", "Language", "Programming", "Other"];
    }

    changeCategory(id) {
        if (this.state.loading) return;
        // this.refs.searchinput.value = "";
        this.setState({
            loading: true,
            selectedCategory: id,
            title: "Loading...",
            term: null
        });
        if (id === 0) {
            this.search("", true);
            return;
        }
        this.search(`?category=${this.state.selectedCategory.replace(" ", "%20")}`, true);
    }

    get content() {
        const guildList = SortedGuildStore.guildPositions;
        const defaultList = AvatarDefaults.DEFAULT_AVATARS;
        if (this.state.connection.state === 1) return this.notConnected;
        return [React.createElement(SettingsTitle, {text: this.state.title}),
            this.state.selectedCategory == "All" && this.bdServer,
            this.state.servers.map((server) => {
                return React.createElement(ServerCard, {key: server.identifier, server: server, join: this.join, guildList: guildList, fallback: defaultList[Math.floor(Math.random() * 5)]});
            }),
            this.state.next && React.createElement(
                "button",
                {type: "button", onClick: () => {
                        if (this.state.loading) return;this.setState({loading: true}); this.search(this.state.next, false);
                    }, className: "ui-button filled brand small grow", style: {width: "100%", marginTop: "10px", marginBottom: "10px"}},
                React.createElement(
                    "div",
                    {className: "ui-button-contents"},
                    this.state.loading ? "Loading" : "Load More"
                )
            ),
            this.state.servers.length > 0 && React.createElement(SettingsTitle, {text: this.state.title})];
    }

    get notConnected() {
        //return React.createElement(SettingsTitle, { text: this.state.title });
        return [React.createElement(
                "h2",
                {className: "ui-form-title h2 margin-reset margin-bottom-20"},
                "Not connected to discordservers.com!",
                React.createElement(
                    "button",
                    {
                        onClick: this.connect,
                        type: "button",
                        className: "ui-button filled brand small grow",
                        style: {
                            display: "inline-block",
                            minHeight: "18px",
                            marginLeft: "10px",
                            lineHeight: "14px"
                        }
                    },
                    React.createElement(
                        "div",
                        {className: "ui-button-contents"},
                        "Connect"
                    )
                )
            ), this.bdServer];
    }

    get footer() {
        return React.createElement(
            "div",
            {className: "ui-tab-bar-header"},
            React.createElement(
                "a",
                {href: "https://discordservers.com", target: "_blank"},
                "Discordservers.com"
            )
        );
    }

    get connection() {
        const {connection} = this.state;
        if (connection.state !== 2) return React.createElement("span", null);

        return React.createElement(
            "span",
            null,
            React.createElement(TabBar.Separator, null),
            React.createElement(
                "span",
                {style: {color: "#b9bbbe", fontSize: "10px", marginLeft: "10px"}},
                "Connected as: ",
                `${connection.user.username}#${connection.user.discriminator}`
            ),
            React.createElement(
                "div",
                {style: {padding: "5px 10px 0 10px"}},
                React.createElement(
                    "button",
                    {style: {width: "100%", minHeight: "20px"}, type: "button", className: "ui-button filled brand small grow"},
                    React.createElement(
                        "div",
                        {className: "ui-button-contents", onClick: this.connect},
                        "Reconnect"
                    )
                )
            )
        );
}
}
