import {React, WebpackModules} from "modules";
import SettingsTitle from "../settings/title";
import ServerCard from "./card";
import Manager from "./manager";

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
    }

    componentDidMount() {
        this.checkConnection();
    }

    async checkConnection() {
        const userData = await Manager.checkConnection();
        if (!userData) {
            return this.setState({loading: true, user: null});
        }
        this.setState({user: userData});
        this.search();
    }

    async connect() {
        await Manager.connect();
        this.checkConnection();
    }

    searchKeyDown(e) {
        if (this.state.loading || e.which !== 13) return;
        this.search(e.target.value);
    }

    async search(term = "", from = 0) {
        this.setState({query: term, loading: true});
        const results = await Manager.search({term, category: this.state.category == "All" ? "" : this.state.category, from});
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

    get searchBox() {
        return React.createElement("input", {onKeyDown: this.searchKeyDown, type: "text", className: "bd-search", placeholder: "Search...", value: this.state.query, maxLength: "50"});
    }

    get title() {
        if (!this.state.user) return "Not connected to DiscordServers.com!";
        if (this.state.loading) return "Loading...";
        const start = this.state.results.from + 1;
        const total = this.state.results.total;
        const end = this.state.results.next ? this.state.results.next : total;
        let title = `Showing ${start}-${end} of ${total} results in ${this.state.category}`;
        if (this.state.query) title += ` for ${this.state.query}`;
        return title;
    }

    get content() {
        const connectButton = this.state.user ? null : {title: "Connect", onClick: this.connect};
        const pinned = this.state.category == "All" || !this.state.user ? this.bdServer : null;
        const servers = this.state.results.servers.map((server) => {
            return React.createElement(ServerCard, {key: server.identifier, server: server});
        });
        return [React.createElement(SettingsTitle, {text: this.title, button: connectButton}),
            pinned,
            servers,
            this.state.results.next ? this.nextButton : null,
            this.state.results.servers.length > 0 && React.createElement(SettingsTitle, {text: this.title})];
    }

    get nextButton() {
        return React.createElement("button", {type: "button", className: "bd-button bd-button-next", onClick: this.loadNextPage}, this.state.loading ? "Loading" : "Load More");
    }

    get connection() {
        const {user} = this.state;
        if (!user) return React.createElement("div", {id: "bd-connection"});
        return React.createElement("div", {id: "bd-connection"},
            React.createElement("div", {className: "bd-footnote"}, `Connected as: `, `${user.username}#${user.discriminator}`),
            React.createElement("button", {type: "button", className: "bd-button bd-button-reconnect", onClick: this.connect}, "Reconnect")
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
        return React.createElement(ServerCard, {server: server, pinned: true});
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
                {section: "HEADER", label: "Search"},
                {section: "CUSTOM", element: () => this.searchBox},
                {section: "HEADER", label: "Categories"},
                ...categories,
                {section: "DIVIDER"},
                {section: "HEADER", label: React.createElement("a", {href: "https://discordservers.com", target: "_blank"}, "Discordservers.com")},
                {section: "DIVIDER"},
                {section: "CUSTOM", element: () => this.connection}
            ],
            theme: "dark"
        });
    }
}
