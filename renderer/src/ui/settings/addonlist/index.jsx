import {React, Settings, Strings, Events, Utilities, DataStore, DiscordClasses} from "modules";
import {Web} from "data";

import {shell} from "electron";

import Dropdown from "../components/dropdown";
import SearchBar from "../components/searchbar";
import TabBar from "../../tabbar";
import Divider from "../../divider";
import SettingsTitle from "../title";

import StorePage from "./store";
import InstalledPage from "./installed";

const CONTROLS = {
    installed: {
        sortOptions: [
            {get label() {return Strings.Addons.name;}, value: "name"},
            {get label() {return Strings.Addons.author;}, value: "author"},
            {get label() {return Strings.Addons.version;}, value: "version"},
            {get label() {return Strings.Addons.added;}, value: "added"},
            {get label() {return Strings.Addons.modified;}, value: "modified"},
            {get label() {return Strings.Addons.isEnabled;}, value: "isEnabled"}
        ],
        directions: [
            {get label() {return Strings.Sorting.ascending;}, value: true},
            {get label() {return Strings.Sorting.descending;}, value: false}
        ],
        viewOptions: [
            {get label() {return Strings.Addons.list;}, value: "list"},
            {get label() {return Strings.Addons.grid;}, value: "grid"}
        ]
    },
    store: {
        sortOptions: [
            {get label() {return Strings.Addons.name;}, value: "name"},
            {get label() {return Strings.Store.Likes;}, value: "likes"},
            {get label() {return Strings.Store.downloads;}, value: "downloads"},
            {get label() {return Strings.Addons.added;}, value: "release_date"}
        ],
        directions: [
            {get label() {return Strings.Sorting.ascending;}, value: true},
            {get label() {return Strings.Sorting.descending;}, value: false}
        ],
        viewOptions: [
            {get label() {return Strings.Addons.list;}, value: "list"},
            {get label() {return Strings.Addons.grid;}, value: "grid"}
        ]
    }
};

const PAGES = {
    installed: {
        get label() {return Strings.Addons.installed;},
        component: InstalledPage,
        defaults: {
            sort: "name",
            ascending: true,
            view: "list"
        }
    },
    store: {
        get label() {return Strings.Addons.store;},
        component: StorePage,
        state: {
            selectedTag: "all"
        },
        controls: ({setState, state, type}) => <div className="bd-store-tags">
            <div className="bd-store-tags-inner">
                {Web.TAGS[type].map(tag => {
                    return <span
                        onClick={() => setState({selectedTag: tag})}
                        className={Utilities.className({selected: state.selectedTag === tag})}
                    >{tag}</span>;
                })}
            </div>
        </div>,
        defaults: {
            sort: "release_date",
            ascending: false,
            view: "grid"
        }
    }
};

export default class AddonList extends React.Component {
    constructor(props) {
        super(props);
        
        this.update = this.update.bind(this);
        this.reload = this.reload.bind(this);
        this.editAddon = this.editAddon.bind(this);
        this.events = [`${this.props.type}-loaded`, `${this.props.type}-unloaded`];
        this.state = {
            query: "",
            selectedTag: "all",
            viewStyle: this.viewStyle,
            sortStyle: this.sortStyle,
            ascending: this.ascending,
            page: "installed",
            controlsVisible: true
        };

        this.search = Utilities.debounce(value => {
            this.setState({query: value});
        }, 200);
    }

    componentDidMount() {
        for (const event of this.events) Events.on(event, this.update);
    }

    componentWillUnmount() {
        for (const event of this.events) Events.off(event, this.update);
    }

    get currentPage() {return this.state?.page || "installed";}

    get defaults() {
        const defaults = PAGES[this.currentPage]?.defaults;

        return defaults || {
            sort: "name",
            ascending: true,
            view: "list"
        };
    }

    get sortStyle() {
        return this.getControlState("sort", this.defaults.sort);
    }

    get ascending() {
        return this.getControlState("ascending", this.defaults.ascending);
    }

    get viewStyle() {
        return this.getControlState("view", this.defaults.view);
    }

    get pageControls() {
        if (!PAGES[this.currentPage] || !PAGES[this.currentPage].controls || !this.state.controlsVisible) return null;

        const {controls: Controls} = PAGES[this.currentPage];

        return <Controls
            key={`controls-${this.props.type}`}
            setState={this.setState.bind(this)}
            state={this.state}
            type={this.props.type}
        />;
    }

    update() {this.forceUpdate();}

    getControlState(control, defaultValue) {
        const {type} = this.props;
        const id = `${this.currentPage}ListControls`;
        const controls = DataStore.getBDData(id, {});

        if (!controls[type] || !controls[type][control]) {
            this.setControlState(control, defaultValue);
            return defaultValue;
        }

        return controls[type][control];
    }

    setControlState(control, value) {
        const {type} = this.props;
        const id = `${this.currentPage}ListControls`;
        const controls = DataStore.getBDData(id, {});
        
        if (!controls[type]) controls[type] = {};
        controls[type][control] = value;
        DataStore.setBDData(id, controls);
    }

    reload() {
        if (this.props.refreshList) this.props.refreshList();
        this.forceUpdate();
    }

    changeView(view) {
        this.setControlState("view", view);
        this.setState({viewStyle: view});
    }

    reverse(value) {
        this.setControlState("ascending", value);
        this.setState({ascending: value});
    }

    sort(value) {
        this.setControlState("sort", value);
        this.setState({sortStyle: value});
    }

    editAddon(id) {return this.props.editAddon(id);}

    openFolder(folder) {
        const open = shell.openItem ?? shell.openPath;
        open(folder);
    }

    render() {
        const storeEnabled = Settings.get("settings", "addons", "store");
        const Page = PAGES[this.currentPage]?.component || (() => null);

        return <React.Fragment>
            <div className="bd-addon-list-title">
                {storeEnabled
                    ? <TabBar
                        value={this.state.page}
                        onChange={value => this.setState({page: value})}
                        items={Object.entries(PAGES).map(([id, props]) => ({
                            name: props.label,
                            value: id
                        }))}
                    >
                    </TabBar>
                    : <SettingsTitle key="title" text={this.props.title} />
                }
                <div className="bd-addon-list-filters">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.sortBy}</label>
                        <Dropdown
                            key={`${this.props.type}-${this.currentPage}`}
                            options={CONTROLS[this.currentPage].sortOptions}
                            value={this.sortStyle}
                            onChange={value => this.sort(value)}
                            style="transparent"
                        />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.order}</label>
                        <Dropdown
                            key={`${this.props.type}-${this.currentPage}`}
                            options={CONTROLS[this.currentPage].directions}
                            value={this.ascending}
                            onChange={value => this.reverse(value)}
                            style="transparent"
                        />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Addons.view}</label>
                        <Dropdown
                            key={`${this.props.type}-${this.currentPage}`}
                            options={CONTROLS[this.currentPage].viewOptions}
                            value={this.viewStyle}
                            onChange={value => this.changeView(value)}
                            style="transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="bd-addon-list-controls">
                <SearchBar
                    key={this.props.type + "-search"}
                    size={SearchBar.Sizes.MEDIUM}
                    onChange={this.search}
                    value={this.state.query}
                    placeholder={Strings.Addons.search.format({type: this.props.title})}
                />
                <button
                    className="bd-button size-small"
                    onClick={() => this.openFolder(this.props.folder)}
                >{Strings.Addons.openFolder.format({type: this.props.type})}</button>
            </div>
            {this.pageControls}
            <Divider className={Utilities.className(DiscordClasses.Margins.marginTop20.toString(), DiscordClasses.Margins.marginBottom20.toString())} />
            <Page
                key={`${this.props.type}-${this.currentPage}`}
                state={Object.assign({}, PAGES[this.currentPage].state, this.state)}
                type={this.props.type}
                title={this.props.title}
                addonState={this.props.addonState}
                addonList={this.props.addonList}
                folder={this.props.folder}
                reload={this.props.reload}
                onChange={this.props.onChange}
                refreshList={this.props.refreshList}
                isLoaded={this.props.isLoaded}
                deleteAddon={this.props.deleteAddon}
                installAddon={this.props.installAddon}
                editAddon={this.editAddon}
                confirmAddonDelete={this.props.confirmAddonDelete}
                view={this.viewStyle}
                sort={this.sortStyle}
                query={this.state.query}
                ascending={this.ascending}
                setControlsVisible={(value) => this.setState({controlsVisible: value})}
            />
        </React.Fragment>;
    }
}