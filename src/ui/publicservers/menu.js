import {React, WebpackModules} from "modules";
import SettingsTitle from "../settings/title";
import ServerCard from "./card";
import Manager from "./manager";

const SettingsView = WebpackModules.getByDisplayName("SettingsView");

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

    async connect() {
        await Manager.connect();
        this.checkConnection();
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
        return React.createElement(ServerCard, {server: server, pinned: true});
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
        const userData = await Manager.checkConnection();
        if (!userData) {
            return this.setState({loading: true, connection: {state: 1, user: null}});
        }
        this.setState({connection: {state: 2, user: userData}});
        this.search("", true);
    }

    render() {
        const categories = this.categoryButtons.map(name => ({
                section: name,
                label: name,
                element: () => this.content
            })
        );
        return React.createElement(SettingsView, {
            onClose: this.close,
            onSetSection: this.changeCategory,
            section: this.state.selectedCategory,
            sections: [
                {section: "HEADER", label: "Search"},
                {section: "CUSTOM", element: () => this.searchInput},
                {section: "HEADER", label: "Categories"},
                ...categories,
                {section: "DIVIDER"},
                {section: "HEADER", label: React.createElement("a", {href: "https://discordservers.com", target: "_blank"}, "Discordservers.com")},
                {section: "DIVIDER"},
                {section: "CUSTOM", element: () => this.connection}
            ],
            theme: "dark"
        });
        // return React.createElement(StandardSidebarView, {id: "pubslayer", ref: "sbv", notice: null, theme: "dark", closeAction: this.close, content: this.content, sidebar: this.sidebar});
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
        if (this.state.selectedCategory !== "All") {
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
        if (id === "All") {
            this.search("", true);
            return;
        }
        this.search(`?category=${this.state.selectedCategory.replace(" ", "%20")}`, true);
    }

    get content() {
        const pinned = this.state.selectedCategory == "All" || this.state.connection.state === 1 ? this.bdServer : null;
        const servers = this.state.servers.map((server) => {
            return React.createElement(ServerCard, {key: server.identifier, server: server});
        });
        return [React.createElement(SettingsTitle, {text: this.state.title}),
            pinned,
            servers,
            this.state.next ? this.nextButton : null,
            this.state.servers.length > 0 && React.createElement(SettingsTitle, {text: this.state.title})];
    }

    get nextButton() {
        return React.createElement("button", {
                type: "button",
                onClick: () => {
                    if (this.state.loading) return;
                    this.setState({loading: true});
                    this.search(this.state.next, false);
                },
                className: "ui-button filled brand small grow",
                style: {width: "100%", marginTop: "10px", marginBottom: "10px"}
            },
            React.createElement("div", {className: "ui-button-contents"}, this.state.loading ? "Loading" : "Load More")
        );
    }

    get connection() {
        const {connection} = this.state;
        if (connection.state !== 2) return React.createElement("span", null);

        return React.createElement("span", null,
            React.createElement("span", {style: {color: "#b9bbbe", fontSize: "10px", marginLeft: "10px"}},
                "Connected as: ",
                `${connection.user.username}#${connection.user.discriminator}`
            ),
            React.createElement("div", {style: {padding: "5px 10px 0 10px"}},
                React.createElement("button",
                    {style: {width: "100%", minHeight: "20px"}, type: "button", className: "ui-button filled brand small grow"},
                    React.createElement("div", {className: "ui-button-contents", onClick: this.connect}, "Reconnect")
                )
            )
        );
    }
}
