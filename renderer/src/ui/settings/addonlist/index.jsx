import {Settings, Strings, Events, WebpackModules, Utilities, DataStore, DiscordClasses} from "modules";

import Dropdown from "../components/dropdown";
import SearchBar from "../components/search";
import Divider from "../divider";
import Modals from "../../modals";
import {Reload} from "icons";

import {TAGS, CONTROLS} from "./constants";
import AddonStore from "./store";
import AddonsPage from "./installed";

const Button = WebpackModules.getByProps("BorderColors");

const Pages = {
    installed: {
        get label() {return Strings.Addons.installed},
        component: AddonsPage,
        defaults: {
            sort: "name",
            ascending: true,
            view: "list"
        }
    },
    store: {
        get label() {return Strings.Addons.store},
        component: AddonStore,
        state: {
            selectedTag: "all"
        },
        controls: ({setState, state, type}) => <div className="bd-store-tags">
            <div className="bd-store-tags-inner">
                {TAGS[`${type}s`].map(tag => {
                    return <span
                        onClick={() => setState({selectedTag: tag})}
                        className={Utilities.joinClassNames({selected: state.selectedTag === tag})}
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
    events = [`${this.props.prefix}-loaded`, `${this.props.prefix}-unloaded`];

    constructor(props) {
        super(props);
        
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

    update = () => {this.forceUpdate();}

    componentDidMount() {
        for (const event of this.events) Events.on(event, this.update);
    }

    componentWillUnmount() {
        for (const event of this.events) Events.off(event, this.update);
    }

    get currentPage() {return this.state?.page || "installed";}

    get defaults() {
        const defaults = Pages[this.currentPage]?.defaults;

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
        if (!Pages[this.currentPage] || !Pages[this.currentPage].controls || !this.state.controlsVisible) return null;

        const {controls: Controls} = Pages[this.currentPage];

        return <Controls
            key={`controls-${this.props.type}`}
            setState={this.setState.bind(this)}
            state={this.state}
            type={this.props.type}
        />;
    }

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
        // this.forceUpdate();
    }

    makeTab({label, selected, onSelect = () => {}}) {
        return <div
            className={Utilities.joinClassNames("bd-tab-item", {selected: selected})}
            role="tab"
            aria-disabled="false"
            aria-selected={selected}
            onClick={onSelect}
        >{label}</div>;
    }

    reload() {
        if (typeof (this.props.reload) === "function") this.props.reload();
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

    editAddon = (id) => this.props.editAddon(id);

    deleteAddon = async (id) => {
        const addon = this.props.addonList.find(a => a.id === id);
        const shouldDelete = await this.confirmDelete(addon);
        if (!shouldDelete) return;
        if (typeof (this.props.deleteAddon) === "function") this.props.deleteAddon(addon);
    }

    confirmDelete(addon) {
        return new Promise(resolve => {
            Modals.showConfirmationModal(Strings.Modals.confirmAction, Strings.Addons.confirmDelete.format({name: addon.name}), {
                danger: true,
                confirmText: Strings.Addons.deleteAddon,
                onConfirm: () => {resolve(true);},
                onCancel: () => {resolve(false);}
            });
        });
    }

    openFolder(folder) {
        const shell = require("electron").shell;
        const open = shell.openItem ?? shell.openPath;
        open(folder);
    }

    render() {
        const showReloadIcon = !Settings.get("settings", "addons", "autoReload");
        const Component = Pages[this.currentPage]?.component || (() => null);

        return <React.Fragment>
            <div className="bd-addon-list-title">
                <div className="bd-tab-bar" otherChildren={showReloadIcon && <Reload className="bd-reload" onClick={this.reload} />}>
                    {Object.entries(Pages).map(([id, props]) => {
                        return this.makeTab({
                            label: props.label,
                            selected: this.state.page === id,
                            onSelect: () => this.setState({page: id})
                        });
                    })}
                </div>
                <div className="bd-addon-list-filters">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.sortBy}</label>
                        <Dropdown key={`${this.props.type}-${this.currentPage}`} options={CONTROLS[this.currentPage].sortOptions} value={this.sortStyle} onChange={value => this.sort(value)} style="transparent" />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.order}</label>
                        <Dropdown key={`${this.props.type}-${this.currentPage}`} options={CONTROLS[this.currentPage].directions} value={this.ascending} onChange={value => this.reverse(value)} style="transparent" />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">View</label>
                        <Dropdown key={`${this.props.type}-${this.currentPage}`} options={CONTROLS[this.currentPage].viewOptions} value={this.viewStyle} onChange={value => this.changeView(value)} style="transparent" />
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
                <Button
                    size={Button.Sizes.SMALL}
                    onClick={() => this.openFolder(this.props.folder)}
                >{Strings.Addons.openFolder.format({type: _.upperFirst(this.props.type)})}</Button>
            </div>
            {this.pageControls}
            {<Divider className={Utilities.joinClassNames(DiscordClasses.Margins.marginTop20.toString(), DiscordClasses.Margins.marginBottom20.toString())} />}
            <Component
                key={`${this.props.type}-${this.currentPage}`}
                state={Object.assign({}, Pages[this.currentPage].state, this.state)}
                type={this.props.type}
                title={this.props.title}
                addonState={this.props.addonState}
                addonList={this.props.addonList}
                folder={this.props.folder}
                reload={this.props.reload}
                onChange={this.props.onChange}
                refreshList={this.props.refreshList}
                isLoaded={this.props.isLoaded}
                editAddon={this.editAddon}
                deleteAddon={this.deleteAddon}
                view={this.viewStyle}
                sort={this.sortStyle}
                query={this.state.query}
                ascending={this.ascending}
                setControlsVisible={(value) => this.setState({controlsVisible: value})}
            />
        </React.Fragment>;
    }
}