import {React, Settings, Strings, Events, Logger} from "modules";

import Modals from "../modals";
import SettingsTitle from "./title";
import ReloadIcon from "../icons/reload";
import AddonCard from "./addoncard";
import Dropdown from "./components/dropdown";
import Search from "./components/search";
import ErrorBoundary from "../errorboundary";

export default class AddonList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {sort: "name", ascending: true, query: ""};
        this.sort = this.sort.bind(this);
        this.reverse = this.reverse.bind(this);
        this.search = this.search.bind(this);
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        Events.on(`${this.props.prefix}-loaded`, this.update);
        Events.on(`${this.props.prefix}-unloaded`, this.update);
    }

    componentWillUnmount() {
        Events.off(`${this.props.prefix}-loaded`, this.update);
        Events.off(`${this.props.prefix}-unloaded`, this.update);
    }

    update() {
        this.forceUpdate();
    }

    reload() {
        if (this.props.refreshList) this.props.refreshList();
        this.forceUpdate();
    }

    reverse(value) {
        this.setState({ascending: value});
    }

    sort(value) {
        this.setState({sort: value});
    }

    search(event) {
        this.setState({query: event.target.value.toLocaleLowerCase()});
    }

    get sortOptions() {
        return [
            {label: Strings.Addons.name, value: "name"},
            {label: Strings.Addons.author, value: "author"},
            {label: Strings.Addons.version, value: "version"},
            {label: Strings.Addons.added, value: "added"},
            {label: Strings.Addons.modified, value: "modified"}
        ];
    }

    get directions() {
        return [
            {label: Strings.Sorting.ascending, value: true},
            {label: Strings.Sorting.descending, value: false}
        ];
    }

    render() {
        const {title, folder, addonList, addonState, onChange, reload} = this.props;
        const showReloadIcon = !Settings.get("settings", "addons", "autoReload");
        const button = folder ? {
            title: Strings.Addons.openFolder.format({type: title}),
            onClick: () => {
                const shell = require("electron").shell;
                const open = shell.openItem || shell.openPath;
                open(folder);
        }} : null;
        const sortedAddons = addonList.sort((a, b) => {
            const first = a[this.state.sort];
            const second = b[this.state.sort];
            if (typeof(first) == "string") return first.toLocaleLowerCase().localeCompare(second.toLocaleLowerCase());
            if (first > second) return 1;
            if (second > first) return -1;
            return 0;
        });
        if (!this.state.ascending) sortedAddons.reverse();
        return [
            <SettingsTitle key="title" text={title} button={button} otherChildren={showReloadIcon && <ReloadIcon className="bd-reload" onClick={this.reload.bind(this)} />} />,
            <div className="bd-controls bd-addon-controls">
                <Search onChange={this.search} placeholder={`${Strings.Addons.search.format({type: this.props.title})}...`} />
                <div className="bd-addon-dropdowns">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.sortBy}:</label>
                        <Dropdown options={this.sortOptions} onChange={this.sort} style="transparent" />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.order}:</label>
                        <Dropdown options={this.directions} onChange={this.reverse} style="transparent" />
                    </div>
                    
                </div>
            </div>,
            <div key="addonList" className={"bd-addon-list"}>
            {sortedAddons.map(addon => {
                if (this.state.query) {
                    let matches = addon.name.toLocaleLowerCase().includes(this.state.query);
                    matches = matches || addon.author.toLocaleLowerCase().includes(this.state.query);
                    matches = matches || addon.description.toLocaleLowerCase().includes(this.state.query);
                    if (!matches) return null;
                }
                const hasSettings = addon.type && typeof(addon.plugin.getSettingsPanel) === "function";
                const getSettings = hasSettings && addon.plugin.getSettingsPanel.bind(addon.plugin);
                return <ErrorBoundary><AddonCard editAddon={this.editAddon.bind(this, addon.id)} deleteAddon={this.deleteAddon.bind(this, addon.id)} showReloadIcon={showReloadIcon} key={addon.id} enabled={addonState[addon.id]} addon={addon} onChange={onChange} reload={reload} hasSettings={hasSettings} getSettingsPanel={getSettings} /></ErrorBoundary>;
            })}
            </div>
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
    set: function() {Logger.warn("AddonList", "Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});