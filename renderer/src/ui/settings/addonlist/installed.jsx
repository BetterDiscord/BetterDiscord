import Logger from "common/logger";
import {React, Strings, Events} from "modules";
import {Web} from "data";

import AddonCard from "./addoncard";
import ErrorBoundary from "../../errorboundary";

import NoResults from "../../blankslates/noresults";
import EmptyImage from "../../blankslates/emptyimage";

export default class InstalledPage extends React.Component {
    constructor() {
        super();

        this.update = this.update.bind(this);
    }

    componentDidMount() {
        Events.on(`${this.props.type}-loaded`, this.update);
        Events.on(`${this.props.type}-unloaded`, this.update);
    }

    componentWillUnmount() {
        Events.off(`${this.props.type}-loaded`, this.update);
        Events.off(`${this.props.type}-unloaded`, this.update);
    }

    update() {
        this.forceUpdate();
    }

    get emptyImage() {
        const message = Strings.Addons.blankSlateMessage.format({link: `${Web.PAGES[`${this.props.type}s`]}`, type: this.props.type}).toString();
        return <EmptyImage title={Strings.Addons.blankSlateHeader.format({type: this.props.type})} message={message} />;
    }

    render() {
        const containerState = this.props.state;
        const {addonList, addonState, onChange, reload} = this.props;

        let sortedAddons = addonList.sort((a, b) => {
            const sortByEnabled = this.props.sort === "isEnabled";
            const first = sortByEnabled ? addonState[a.id] : a[this.props.sort];
            const second = sortByEnabled ? addonState[b.id] : b[this.props.sort]; 
            const stringSort = (str1, str2) => str1.toLocaleLowerCase().localeCompare(str2.toLocaleLowerCase());
            if (typeof(first) == "string") return stringSort(first, second);
            if (typeof(first) == "boolean") return (first === second) ? stringSort(a.name, b.name) : first ? -1 : 1;
            if (first > second) return 1;
            if (second > first) return -1;
            return 0;
        });
        if (!this.props.ascending) sortedAddons.reverse();
        if (this.props.query) {
            sortedAddons = sortedAddons.filter(addon => {
                let matches = addon.name.toLocaleLowerCase().includes(this.props.query);
                matches = matches || addon.author.toLocaleLowerCase().includes(this.props.query);
                matches = matches || addon.description.toLocaleLowerCase().includes(this.props.query);
                if (!matches) return false;
                return true;
            });
        }

        const renderedCards = sortedAddons.map(addon => {
            const hasSettings = addon.instance && typeof(addon.instance.getSettingsPanel) === "function";
            const getSettings = hasSettings && addon.instance.getSettingsPanel.bind(addon.instance);
            return <ErrorBoundary>
                <AddonCard
                    type={this.props.type}
                    editAddon={this.props.editAddon.bind(this, addon.id)}
                    confirmAddonDelete={this.props.confirmAddonDelete.bind(this, addon)}
                    disabled={addon.partial}
                    key={addon.id}
                    enabled={addonState[addon.id]}
                    addon={addon}
                    onChange={onChange}
                    reload={reload}
                    hasSettings={hasSettings}
                    getSettingsPanel={getSettings}
                />
            </ErrorBoundary>;
        });

        const hasAddonsInstalled = this.props.addonList.length !== 0;
        const isSearching = !!containerState.query;
        const hasResults = sortedAddons.length !== 0;

        return <React.Fragment>
            {!hasAddonsInstalled && this.emptyImage}
            {isSearching && !hasResults && hasAddonsInstalled && <NoResults />}
            {hasAddonsInstalled && <div key="addonList" className={"bd-addon-list" + (this.props.view == "grid" ? " bd-grid-view" : "")}>{renderedCards}</div>}
        </React.Fragment>;
    }
}

const originalRender = InstalledPage.prototype.render;
Object.defineProperty(InstalledPage.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {Logger.warn("AddonList", "Addon guideline for plugins #3 https://docs.betterdiscord.app/plugins/introduction/guidelines/#scope");},
    get: () => originalRender
});