import {React, WebpackModules, Strings} from "modules";
import Modals from "../modals";
import SettingsTitle from "../settings/title";
import ServerCard from "./card";
import EmptyResults from "./noresults";
import Connection from "../../structs/psconnection";
import Search from "../settings/components/search";


const SettingsView = WebpackModules.getByDisplayName("SettingsView");
const GuildActions = WebpackModules.getByProps("transitionToGuildSync");
const LayerManager = WebpackModules.getByProps("popLayer");

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

export default class PublicServers extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tab: "Featured",
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

        this.featured = [];
        this.popular = [];
        this.keywords = [];

        this.changeTab = this.changeTab.bind(this);
        this.searchKeyDown = this.searchKeyDown.bind(this);
        this.connect = this.connect.bind(this);
        this.loadNextPage = this.loadNextPage.bind(this);
        this.join = this.join.bind(this);
        this.navigateTo = this.navigateTo.bind(this);
    }

    componentDidMount() {
        this.getDashboard();
        this.checkConnection();
    }

    async checkConnection() {
        const userData = await Connection.checkConnection();
        if (!userData) return this.setState({user: null});
        this.setState({user: userData});
    }

    async getDashboard() {
        const dashboardData = await Connection.getDashboard();
        const featuredFirst = dashboardData.results[0].key === "featured";
        const featuredServers = dashboardData.results[featuredFirst ? 0 : 1].response.hits;
        const popularServers = dashboardData.results[featuredFirst ? 1 : 0].response.hits;
        const mainKeywords = dashboardData.mainKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).sort();

        featuredServers.unshift(betterDiscordServer);
        
        this.featured = featuredServers;
        this.popular = popularServers;
        this.keywords = mainKeywords;
        
        this.setState({loading: false});
        this.changeTab(this.state.tab);
    }

    async connect() {
        await Connection.connect();
        this.checkConnection();
    }

    searchKeyDown(e) {
        if (this.state.loading || e.which !== 13) return;
        const term = e.target.value;
        if (this.state.tab == "Featured" || this.state.tab == "Popular") this.setState({tab: "All"}, () => this.search(term));
        else this.search(term);
    }

    async search(term = "", from = 0) {
        this.setState({query: term, loading: true});
        const results = await Connection.search({term, keyword: this.state.tab == "All" || this.state.tab == "Featured" || this.state.tab == "Popular" ? "" : this.state.tab, from});
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

    async changeTab(id) {
        if (this.state.loading) return;
        await new Promise(resolve => this.setState({tab: id}, resolve));
        if (this.state.tab === "Featured" || this.state.tab == "Popular") {
            return this.setState({results: {
                servers: this[this.state.tab.toLowerCase()],
                size: this[this.state.tab.toLowerCase()].length,
                from: 0,
                total: this[this.state.tab.toLowerCase()].length,
                next: null
            }});
        }

        this.search();
    }

    loadNextPage() {
        if (this.state.loading) return;
        this.search(this.state.query, this.state.results.next);
    }

    async join(id, native = false) {
        if (!this.state.user && !native) {
            return Modals.showConfirmationModal(Strings.PublicServers.notConnected, Strings.PublicServers.connectionRequired, {
                cancelText: Strings.Modals.nevermind,
                confirmText: Strings.Modals.okay,
                onConfirm: () => {
                    this.connect().then(() => Connection.join(id, native));
                }
            });
        }
        return await Connection.join(id, native);
    }

    navigateTo(id) {
        if (GuildActions) GuildActions.transitionToGuildSync(id);
        if (LayerManager) LayerManager.popLayer();
    }

    get searchBox() {
        return <Search onKeyDown={this.searchKeyDown} className="bd-server-search" placeholder={`${Strings.PublicServers.search}...`} />;
    }

    get title() {
        if (this.state.loading) return `${Strings.PublicServers.loading}...`;
        const start = this.state.results.from + 1;
        const total = this.state.results.total;
        const end = this.state.results.next ? this.state.results.next : total;
        let title = Strings.PublicServers.results.format({start, end, total, category: this.state.tab});
        if (this.state.query) title += " " + Strings.PublicServers.query.format({query: this.state.query});
        return title;
    }

    get content() {
        const connectButton = this.state.user ? null : {title: Strings.PublicServers.connect, onClick: this.connect};
        const servers = this.state.results.servers.map((server) => {
            return React.createElement(ServerCard, {key: server.identifier, server: server, joined: Connection.hasJoined(server.identifier), join: this.join, navigateTo: this.navigateTo, defaultAvatar: Connection.getDefaultAvatar});
        });
        return [React.createElement(SettingsTitle, {text: this.title, button: connectButton}),
            this.state.results.total ? React.createElement("div", {className: "bd-card-list"}, servers) : React.createElement(EmptyResults),
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

    render() {
        const keywords = this.keywords.map(name => ({
                section: name,
                label: name,
                element: () => this.content
            })
        );
        return React.createElement(SettingsView, {
            onClose: this.props.close,
            onSetSection: this.changeTab,
            section: this.state.tab,
            sections: [
                {section: "HEADER", label: Strings.PublicServers.search},
                {section: "CUSTOM", element: () => this.searchBox},
                {section: "DIVIDER"},
                {section: "HEADER", label: Strings.PublicServers.categories},
                {section: "All", label: "All", element: () => this.content},
                {section: "Featured", label: "Featured", element: () => this.content},
                {section: "Popular", label: "Popular", element: () => this.content},
                {section: "DIVIDER"},
                {section: "HEADER", label: Strings.PublicServers.keywords},
                ...keywords,
                {section: "DIVIDER"},
                {section: "HEADER", label: React.createElement("a", {href: "https://discordservers.com", target: "_blank"}, "DiscordServers.com")},
                {section: "DIVIDER"},
                {section: "CUSTOM", element: () => this.connection}
            ],
            theme: "dark"
        });
    }
}
