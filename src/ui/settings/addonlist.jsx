import {React, Settings, Strings} from "modules";

import SettingsTitle from "./title";
import ReloadIcon from "../icons/reload";
import AddonCard from "./addoncard";
import Select from "./components/select";
import Search from "./components/search";

const sortOptions = [
    {label: "Name", value: "name"},
    {label: "Author", value: "author"},
    {label: "Version", value: "version"},
    {label: "Date Added", value: "added"},
    {label: "Date Modified", value: "modified"}
];

const directionOptions = [
    {label: "Ascending", value: "true"},
    {label: "Descending", value: "false"}
];

export default class AddonList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {sort: "name", ascending: true, query: ""};
        this.sort = this.sort.bind(this);
        this.reverse = this.reverse.bind(this);
        this.search = this.search.bind(this);
    }

    reload() {
        if (this.props.refreshList) this.props.refreshList();
        this.forceUpdate();
    }

    reverse(value) {
        this.setState({ascending: value == "true"});
    }

    sort(value) {
        this.setState({sort: value});
    }

    search(event) {
        this.setState({query: event.target.value.toLocaleLowerCase()});
    }

    render() {
        const {title, folder, addonList, addonState, onChange, reload} = this.props;
        const showReloadIcon = !Settings.get("settings", "addons", "autoReload");
        const button = folder ? {title: Strings.Addons.openFolder.format({type: title}), onClick: () => {require("electron").shell.openItem(folder);}} : null;
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
                <Search onChange={this.search} placeholder={`Search...`} />
                <div className="bd-addon-dropdowns">
                    <Select options={sortOptions} label="Sort By:" onChange={this.sort} style="transparent" />
                    <Select options={directionOptions} label="Order:" onChange={this.reverse} style="transparent" />
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
                return <AddonCard showReloadIcon={showReloadIcon} key={addon.id} enabled={addonState[addon.id]} addon={addon} onChange={onChange} reload={reload} hasSettings={hasSettings} getSettingsPanel={getSettings} />;
            })}
            </div>
        ];
    }
}