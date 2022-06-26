import Logger from "common/logger";
import {React, Settings, Strings, Events, WebpackModules, DataStore} from "modules";

import Modals from "../modals";
import SettingsTitle from "./title";
import ReloadIcon from "../icons/reload";
import AddonCard from "./addoncard";
import Dropdown from "./components/dropdown";
import Search from "./components/search";
import ErrorBoundary from "../errorboundary";

import ListIcon from "../icons/list";
import GridIcon from "../icons/grid";
import NoResults from "../blankslates/noresults";
import EmptyImage from "../blankslates/emptyimage";

const Tooltip = WebpackModules.getByDisplayName("Tooltip");

export default class AddonList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {query: "", sort: this.getControlState("sort", "name"), ascending: this.getControlState("ascending", true), view: this.getControlState("view", "list")};
        this.sort = this.sort.bind(this);
        this.reverse = this.reverse.bind(this);
        this.search = this.search.bind(this);
        this.update = this.update.bind(this);
        this.listView = this.listView.bind(this);
        this.gridView = this.gridView.bind(this);
        this.openFolder = this.openFolder.bind(this);
    }

    componentDidMount() {
        Events.on(`${this.props.prefix}-loaded`, this.update);
        Events.on(`${this.props.prefix}-unloaded`, this.update);
    }

    componentWillUnmount() {
        Events.off(`${this.props.prefix}-loaded`, this.update);
        Events.off(`${this.props.prefix}-unloaded`, this.update);
    }

    onControlChange(control, value) {
        const addonlistControls = DataStore.getBDData("addonlistControls") || {};
        if (!addonlistControls[this.props.type]) addonlistControls[this.props.type] = {};
        addonlistControls[this.props.type][control] = value;
        DataStore.setBDData("addonlistControls", addonlistControls);
    }

    getControlState(control, defaultValue) {
        const addonlistControls = DataStore.getBDData("addonlistControls") || {};
        if (!addonlistControls[this.props.type]) return defaultValue;
        if (!addonlistControls[this.props.type].hasOwnProperty(control)) return defaultValue;
        return addonlistControls[this.props.type][control];
    }

    update() {
        this.forceUpdate();
    }

    reload() {
        if (this.props.refreshList) this.props.refreshList();
        this.forceUpdate();
    }

    listView() {this.changeView("list");}
    gridView() {this.changeView("grid");}
    changeView(view) {
        this.onControlChange("view", view);
        this.setState({view});
    }

    reverse(value) {
        this.onControlChange("ascending", value);
        this.setState({ascending: value});
    }

    sort(value) {
        this.onControlChange("sort", value);
        this.setState({sort: value});
    }

    search(event) {
        this.setState({query: event.target.value.toLocaleLowerCase()});
    }

    openFolder() {
        const shell = require("electron").shell;
        const open = shell.openItem || shell.openPath;
        open(this.props.folder);
    }

    get sortOptions() {
        return [
            {label: Strings.Addons.name, value: "name"},
            {label: Strings.Addons.author, value: "author"},
            {label: Strings.Addons.version, value: "version"},
            {label: Strings.Addons.added, value: "added"},
            {label: Strings.Addons.modified, value: "modified"},
            {label: Strings.Addons.isEnabled, value: "isEnabled"}
        ];
    }

    get directions() {
        return [
            {label: Strings.Sorting.ascending, value: true},
            {label: Strings.Sorting.descending, value: false}
        ];
    }

    get emptyImage() {
        const message = Strings.Addons.blankSlateMessage.format({link: `https://betterdiscord.app/${this.props.type}s`, type: this.props.type}).toString();
        return <EmptyImage title={Strings.Addons.blankSlateHeader.format({type: this.props.type})} message={message}>
            <button className="bd-button" onClick={this.openFolder}>{Strings.Addons.openFolder.format({type: this.props.type})}</button>
        </EmptyImage>;
    }

    makeControlButton(title, children, action, selected = false) {
        return <Tooltip color="primary" position="top" text={title}>
                    {(props) => {
                        return <button {...props} className={"bd-button bd-view-button" + (selected ? " selected" : "")} onClick={action}>{children}</button>;
                    }}
                </Tooltip>;
    }

    render() {
        const {title, folder, addonList, addonState, onChange, reload} = this.props;
        const showReloadIcon = !Settings.get("settings", "addons", "autoReload");
        const button = folder ? {title: Strings.Addons.openFolder.format({type: title}), onClick: this.openFolder} : null;
        let sortedAddons = addonList.sort((a, b) => {
            const sortByEnabled = this.state.sort === "isEnabled";
            const first = sortByEnabled ? addonState[a.id] : a[this.state.sort];
            const second = sortByEnabled ? addonState[b.id] : b[this.state.sort]; 
            const stringSort = (str1, str2) => str1.toLocaleLowerCase().localeCompare(str2.toLocaleLowerCase());
            if (typeof(first) == "string") return stringSort(first, second);
            if (typeof(first) == "boolean") return (first === second) ? stringSort(a.name, b.name) : first ? -1 : 1;
            if (first > second) return 1;
            if (second > first) return -1;
            return 0;
        });
        if (!this.state.ascending) sortedAddons.reverse();
        if (this.state.query) {
            sortedAddons = sortedAddons.filter(addon => {
                let matches = addon.name.toLocaleLowerCase().includes(this.state.query);
                matches = matches || addon.author.toLocaleLowerCase().includes(this.state.query);
                matches = matches || addon.description.toLocaleLowerCase().includes(this.state.query);
                if (!matches) return false;
                return true;
            });
        }

        const renderedCards = sortedAddons.map(addon => {
            const hasSettings = addon.instance && typeof(addon.instance.getSettingsPanel) === "function";
            const getSettings = hasSettings && addon.instance.getSettingsPanel.bind(addon.instance);
            return <ErrorBoundary><AddonCard type={this.props.type} editAddon={this.editAddon.bind(this, addon.id)} deleteAddon={this.deleteAddon.bind(this, addon.id)} showReloadIcon={showReloadIcon} key={addon.id} enabled={addonState[addon.id]} addon={addon} onChange={onChange} reload={reload} hasSettings={hasSettings} getSettingsPanel={getSettings} /></ErrorBoundary>;
        });

        const hasAddonsInstalled = this.props.addonList.length !== 0;
        const isSearching = !!this.state.query;
        const hasResults = sortedAddons.length !== 0;

        return [
            <SettingsTitle key="title" text={title} button={button} otherChildren={showReloadIcon && <ReloadIcon className="bd-reload" onClick={this.reload.bind(this)} />} />,
            <div className={"bd-controls bd-addon-controls"}>
                <Search onChange={this.search} placeholder={`${Strings.Addons.search.format({type: this.props.title})}...`} />
                <div className="bd-controls-advanced">
                    <div className="bd-addon-dropdowns">
                        <div className="bd-select-wrapper">
                            <label className="bd-label">{Strings.Sorting.sortBy}:</label>
                            <Dropdown options={this.sortOptions} value={this.state.sort} onChange={this.sort} style="transparent" />
                        </div>
                        <div className="bd-select-wrapper">
                            <label className="bd-label">{Strings.Sorting.order}:</label>
                            <Dropdown options={this.directions} value={this.state.ascending} onChange={this.reverse} style="transparent" />
                        </div>
                    </div>
                    <div className="bd-addon-views">
                        {this.makeControlButton("List View", <ListIcon />, this.listView, this.state.view === "list")}
                        {this.makeControlButton("Grid View", <GridIcon />, this.gridView, this.state.view === "grid")}
                    </div>
                </div>
            </div>,
            !hasAddonsInstalled && this.emptyImage,
            isSearching && !hasResults && hasAddonsInstalled && <NoResults />,
            hasAddonsInstalled && <div key="addonList" className={"bd-addon-list" + (this.state.view == "grid" ? " bd-grid-view" : "")}>{renderedCards}</div>
        ];
    }

    editAddon(id) {
        if (this.props.editAddon) this.props.editAddon(id);
    }

    async deleteAddon(id) {
        const addon = this.props.addonList.find(a => a.id == id);
        const shouldDelete = await this.confirmDelete(addon);
        if (!shouldDelete) return;
        if (this.props.deleteAddon) this.props.deleteAddon(addon);
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
}

const originalRender = AddonList.prototype.render;
Object.defineProperty(AddonList.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {Logger.warn("AddonList", "Addon policy for plugins #5 https://github.com/BetterDiscord/BetterDiscord/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});