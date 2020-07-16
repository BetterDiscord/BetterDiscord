import {React, WebpackModules, Strings} from "modules";
import SettingsTitle from "../settings/title";
import ServerCard from "./card";
import Connection from "../../structs/psconnection";
import Search from "../settings/components/search";

const SettingsView = WebpackModules.getByDisplayName("SettingsView");

export default class PublicServers extends React.Component {

    get categoryButtons() {
        return ["All", "FPS Games", "MMO Games", "Strategy Games", "MOBA Games", "RPG Games", "Tabletop Games", "Sandbox Games", "Simulation Games", "Music", "Community", "Language", "Programming", "Other"];
    }

    constructor(props) {
        super(props);
        this.state = {
            category: "All",
            query: "",
            loading: true,
            user: null,
            results: {
                servers: [],
                size: 0,
                from: 0,
                total: 0,
                next: null
            }
        };

        this.changeCategory = this.changeCategory.bind(this);
        this.searchKeyDown = this.searchKeyDown.bind(this);
        this.connect = this.connect.bind(this);
        this.loadNextPage = this.loadNextPage.bind(this);
        this.join = this.join.bind(this);
    }

    componentDidMount() {
        this.checkConnection();
    }

    async checkConnection() {
        const userData = await Connection.checkConnection();
        if (!userData) {
            return this.setState({loading: true, user: null});
        }
        this.setState({user: userData});
        this.search();
    }

    async connect() {
        await Connection.connect();
        this.checkConnection();
    }

    searchKeyDown(e) {
        if (this.state.loading || e.which !== 13) return;
        this.search(e.target.value);
    }

    async search(term = "", from = 0) {
        this.setState({query: term, loading: true});
        const results = await Connection.search({term, category: this.state.category == "All" ? "" : this.state.category, from});
        if (!results) {
            return this.setState({results: {
                servers: [],
                size: 0,
                from: 0,
                total: 0,
                next: null
            }});
        }
        this.setState({loading: false, results});
    }

    async changeCategory(id) {
        if (this.state.loading) return;
        await new Promise(resolve => this.setState({category: id}, resolve));
        this.search();
    }

    loadNextPage() {
        if (this.state.loading) return;
        this.search(this.state.query, this.state.results.next);
    }

    async join(id, native = false) {
        return await Connection.join(id, native);
    }

    get searchBox() {
        return <Search onKeyDown={this.searchKeyDown} placeholder={`${Strings.PublicServers.search}...`} />;
    }

    get title() {
        if (!this.state.user) return Strings.PublicServers.notConnected;
        if (this.state.loading) return `${Strings.PublicServers.loading}...`;
        const start = this.state.results.from + 1;
        const total = this.state.results.total;
        const end = this.state.results.next ? this.state.results.next : total;
        let title = Strings.PublicServers.results.format({start, end, total, category: this.state.category});
        if (this.state.query) title += " " + Strings.PublicServers.query.format({query: this.state.query});
        return title;
    }

    get content() {
        const connectButton = this.state.user ? null : {title: Strings.PublicServers.connect, onClick: this.connect};
        const pinned = this.state.category == "All" || !this.state.user ? this.bdServer : null;
        const servers = this.state.results.servers.map((server) => {
            return React.createElement(ServerCard, {key: server.identifier, server: server, joined: Connection.hasJoined(server.identifier), join: this.join, defaultAvatar: Connection.getDefaultAvatar});
        });
        return [React.createElement(SettingsTitle, {text: this.title, button: connectButton}),
            pinned,
            servers,
            this.state.results.next ? this.nextButton : null,
            this.state.results.servers.length > 0 && React.createElement(SettingsTitle, {text: this.title})];
    }

    get nextButton() {
        return React.createElement("button", {type: "button", className: "bd-button bd-button-next", onClick: this.loadNextPage}, this.state.loading ? Strings.PublicServers.loading : Strings.PublicServers.loadMore);
    }

    get connection() {
        const {user} = this.state;
        if (!user) return React.createElement("div", {id: "bd-connection"});
        return React.createElement("div", {id: "bd-connection"},
            React.createElement("div", {className: "bd-footnote"}, Strings.PublicServers.connection.format(user)),
            React.createElement("button", {type: "button", className: "bd-button bd-button-reconnect", onClick: this.connect}, Strings.PublicServers.reconnect)
        );
    }

    get bdServer() {
        const server = {
            name: "BetterDiscord",
            online: "7500+",
            members: "20000+",
            categories: ["community", "programming", "support"],
            description: "Official BetterDiscord server for plugins, themes, support, etc",
            identifier: "86004744966914048",
            iconUrl: "https://cdn.discordapp.com/icons/86004744966914048/292e7f6bfff2b71dfd13e508a859aedd.webp",
            nativejoin: true,
            invite_code: "0Tmfo5ZbORCRqbAd",
            pinned: true
        };
        return React.createElement(ServerCard, {server: server, pinned: true, joined: Connection.hasJoined(server.identifier), defaultAvatar: Connection.getDefaultAvatar});
    }

    render() {
        const categories = this.categoryButtons.map(name => ({
                section: name,
                label: name,
                element: () => this.content
            })
        );
        return React.createElement(SettingsView, {
            onClose: this.props.close,
            onSetSection: this.changeCategory,
            section: this.state.category,
            sections: [
                {section: "HEADER", label: Strings.PublicServers.search},
                {section: "CUSTOM", element: () => this.searchBox},
                {section: "HEADER", label: Strings.PublicServers.categories},
                ...categories,
                {section: "DIVIDER"},
                {section: "HEADER", label: React.createElement("a", {href: "https://discordservers.com", target: "_blank"}, "DiscordServers.com")},
                {section: "DIVIDER"},
                {section: "CUSTOM", element: () => this.connection}
            ],
            theme: "dark"
        });
    }
}
