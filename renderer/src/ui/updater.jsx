import {Config} from "data";
import {React, Events, Strings} from "modules";
import Drawer from "./settings/drawer";
import SettingItem from "./settings/components/item";
import SettingsTitle from "./settings/title";
import Toasts from "./toasts";

import Checkmark from "./icons/check";

const {useState, useCallback, useEffect} = React;

function CoreUpdaterPanel(props) {
    return <Drawer name="BetterDiscord" collapsible={true}>
        <SettingItem name={`Core v${Config.version}`} note={props.hasUpdate ? Strings.Updater.versionAvailable.format({version: props.remoteVersion}) : Strings.Updater.noUpdatesAvailable} inline={true} id={"core-updater"}>
            {!props.hasUpdate && <div className="bd-filled-checkmark"><Checkmark /></div>}
            {props.hasUpdate && <button className="bd-button" onClick={props.update}>{Strings.Updater.updateButton}</button>}
        </SettingItem>
    </Drawer>;
}

function NoUpdates(props) {
    return <div className="bd-empty-updates">
        <Checkmark size="48px" />
        {Strings.Updater.upToDateBlankslate.format({type: props.type})}
    </div>;
}

function AddonUpdaterPanel(props) {
    const filenames = props.pending;
    return <Drawer name={Strings.Panels[props.type]} collapsible={true} button={filenames.length ? {title: Strings.Updater.updateAll, onClick: () => props.updateAll(props.type)} : null}>
        {!filenames.length && <NoUpdates type={props.type} />}
        {filenames.map(f => {
            const info = props.updater.cache[f];
            const addon = props.updater.manager.addonList.find(a => a.filename === f);
            return <SettingItem name={`${addon.name} v${addon.version}`} note={Strings.Updater.versionAvailable.format({version: info.version})} inline={true} id={addon.name}>
                    <button className="bd-button" onClick={() => props.update(props.type, f)}>{Strings.Updater.updateButton}</button>
                </SettingItem>;
    })}
    </Drawer>;
}

export default function UpdaterPanel(props) {
    const [hasCoreUpdate, setCoreUpdate] = useState(props.coreUpdater.hasUpdate);
    const [updates, setUpdates] = useState({plugins: props.pluginUpdater.pending.slice(0), themes: props.themeUpdater.pending.slice(0)});

    const checkAddons = useCallback(async (type) => {
        const updater = type === "plugins" ? props.pluginUpdater : props.themeUpdater;
        await updater.checkAll(false);
        setUpdates({...updates, [type]: updater.pending.slice(0)});
    }, []);

    const update = useCallback(() => {
        checkAddons("plugins");
        checkAddons("themes");
    }, []);

    useEffect(() => {
        Events.on(`plugin-loaded`, update);
        Events.on(`plugin-unloaded`, update);
        Events.on(`theme-loaded`, update);
        Events.on(`theme-unloaded`, update);
        return () => {
            Events.off(`plugin-loaded`, update);
            Events.off(`plugin-unloaded`, update);
            Events.off(`theme-loaded`, update);
            Events.off(`theme-unloaded`, update);
        };
    }, []);

    const checkCoreUpdate = useCallback(async () => {
        await props.coreUpdater.checkForUpdate(false);
        setCoreUpdate(props.coreUpdater.hasUpdate);
    }, []);

    const checkForUpdates = useCallback(async () => {
        Toasts.info(Strings.Updater.checking);
        await checkCoreUpdate();
        await checkAddons("plugins");
        await checkAddons("themes");
        Toasts.info(Strings.Updater.finishedChecking);
    });

    const updateCore = useCallback(async () => {
        await props.coreUpdater.update();
        setCoreUpdate(false);
    }, []);

    const updateAddon = useCallback(async (type, filename) => {
        const updater = type === "plugins" ? props.pluginUpdater : props.themeUpdater;
        await updater.updateAddon(filename);
        setUpdates(prev => {
            prev[type].splice(prev[type].indexOf(filename), 1);
            return prev;
        });
    }, []);

    const updateAllAddons = useCallback(async (type) => {
        const toUpdate = updates[type].slice(0);
        for (const filename of toUpdate) {
            await updateAddon(type, filename);
        }
    }, []);

    return [
        <SettingsTitle text={Strings.Panels.updates} button={{title: Strings.Updater.checkForUpdates, onClick: checkForUpdates}} />,
        <CoreUpdaterPanel remoteVersion={props.coreUpdater.remoteVersion} hasUpdate={hasCoreUpdate} update={updateCore} />,
        <AddonUpdaterPanel type="plugins" pending={updates.plugins} update={updateAddon} updateAll={updateAllAddons} updater={props.pluginUpdater} />,
        <AddonUpdaterPanel type="themes" pending={updates.themes} update={updateAddon} updateAll={updateAllAddons} updater={props.themeUpdater} />,
    ];
}