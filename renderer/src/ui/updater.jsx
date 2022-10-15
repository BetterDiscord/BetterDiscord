import {Config} from "data";
import {React, Events, Strings} from "modules";
import Drawer from "./settings/drawer";
import SettingItem from "./settings/components/item";
import SettingsTitle from "./settings/title";
import Toasts from "./toasts";

import Checkmark from "./icons/check";

class CoreUpdaterPanel extends React.Component {
    render() {
        return <Drawer name="BetterDiscord" collapsible={true}>
            <SettingItem name={`Core v${Config.version}`} note={this.props.hasUpdate ? Strings.Updater.versionAvailable.format({version: this.props.remoteVersion}) : Strings.Updater.noUpdatesAvailable} inline={true} id={"core-updater"}>
                {!this.props.hasUpdate && <div className="bd-filled-checkmark"><Checkmark /></div>}
                {this.props.hasUpdate && <button className="bd-button" onClick={this.props.update}>{Strings.Updater.updateButton}</button>}
            </SettingItem>
        </Drawer>;
    }
}

class NoUpdates extends React.Component {
    render() {
        return <div className="bd-empty-updates">
            <Checkmark size="48px" />
            {Strings.Updater.upToDateBlankslate.format({type: this.props.type})}
        </div>;
    }
}

class AddonUpdaterPanel extends React.Component {
    render() {
        const filenames = this.props.pending;
        return <Drawer name={Strings.Panels[this.props.type]} collapsible={true} button={filenames.length ? {title: Strings.Updater.updateAll, onClick: () => this.props.updateAll(this.props.type)} : null}>
            {!filenames.length && <NoUpdates type={this.props.type} />}
            {filenames.map(f => {
                const info = this.props.updater.cache[f];
                const addon = this.props.updater.manager.addonList.find(a => a.filename === f);
                return <SettingItem name={`${addon.name} v${addon.version}`} note={Strings.Updater.versionAvailable.format({version: info.version})} inline={true} id={addon.name}>
                        <button className="bd-button" onClick={() => this.props.update(this.props.type, f)}>{Strings.Updater.updateButton}</button>
                    </SettingItem>;
        })}
        </Drawer>;
    }
}

export default class UpdaterPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasCoreUpdate: this.props.coreUpdater.hasUpdate,
            plugins: this.props.pluginUpdater.pending.slice(0),
            themes: this.props.themeUpdater.pending.slice(0)
        };

        this.checkForUpdates = this.checkForUpdates.bind(this);
        this.updateAddon = this.updateAddon.bind(this);
        this.updateCore = this.updateCore.bind(this);
        this.updateAllAddons = this.updateAllAddons.bind(this);
        this.update = this.update.bind(this);
    }

    update() {
        this.checkAddons("plugins");
        this.checkAddons("themes");
    }

    componentDidMount() {
        Events.on(`plugin-loaded`, this.update);
        Events.on(`plugin-unloaded`, this.update);
        Events.on(`theme-loaded`, this.update);
        Events.on(`theme-unloaded`, this.update);
    }

    componentWillUnmount() {
        Events.off(`plugin-loaded`, this.update);
        Events.off(`plugin-unloaded`, this.update);
        Events.off(`theme-loaded`, this.update);
        Events.off(`theme-unloaded`, this.update);
    }

    async checkForUpdates() {
        Toasts.info(Strings.Updater.checking);
        await this.checkCoreUpdate();
        await this.checkAddons("plugins");
        await this.checkAddons("themes");
        Toasts.info(Strings.Updater.finishedChecking);
    }

    async checkCoreUpdate() {
        await this.props.coreUpdater.checkForUpdate(false);
        this.setState({hasCoreUpdate: this.props.coreUpdater.hasUpdate});
    }

    async updateCore() {
        await this.props.coreUpdater.update();
        this.setState({hasCoreUpdate: false});
    }

    async checkAddons(type) {
        const updater = type === "plugins" ? this.props.pluginUpdater : this.props.themeUpdater;
        await updater.checkAll(false);
        this.setState({[type]: updater.pending.slice(0)});
    }

    async updateAddon(type, filename) {
        const updater = type === "plugins" ? this.props.pluginUpdater : this.props.themeUpdater;
        await updater.updateAddon(filename);
        this.setState(prev => {
            prev[type].splice(prev[type].indexOf(filename), 1);
            return prev;
        });
    }

    async updateAllAddons(type) {
        const toUpdate = this.state[type].slice(0);
        for (const filename of toUpdate) {
            await this.updateAddon(type, filename);
        }
    }

    render() {
        return [
            <SettingsTitle text={Strings.Panels.updates} button={{title: Strings.Updater.checkForUpdates, onClick: this.checkForUpdates}} />,
            <CoreUpdaterPanel remoteVersion={this.props.coreUpdater.remoteVersion} hasUpdate={this.state.hasCoreUpdate} update={this.updateCore} />,
            <AddonUpdaterPanel type="plugins" pending={this.state.plugins} update={this.updateAddon} updateAll={this.updateAllAddons} updater={this.props.pluginUpdater} />,
            <AddonUpdaterPanel type="themes" pending={this.state.themes} update={this.updateAddon} updateAll={this.updateAllAddons} updater={this.props.themeUpdater} />,
        ];
    }
}