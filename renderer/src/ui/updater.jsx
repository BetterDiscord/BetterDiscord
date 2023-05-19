import Config from "@data/config";

import React from "@modules/react";
import Strings from "@modules/strings";
import Events from "@modules/emitter";

import Drawer from "./settings/drawer";
import SettingItem from "./settings/components/item";
import SettingsTitle from "./settings/title";
import Toasts from "./toasts";

import Checkmark from "@ui/icons/check";

const {useState, useCallback, useEffect} = React;

function CoreUpdaterPanel({hasUpdate, remoteVersion, update}) {
    return <Drawer name="BetterDiscord" collapsible={true}>
        <SettingItem name={`Core v${Config.version}`} note={hasUpdate ? Strings.Updater.versionAvailable.format({version: remoteVersion}) : Strings.Updater.noUpdatesAvailable} inline={true} id={"core-updater"}>
            {!hasUpdate && <div className="bd-filled-checkmark"><Checkmark /></div>}
            {hasUpdate && <button className="bd-button" onClick={update}>{Strings.Updater.updateButton}</button>}
        </SettingItem>
    </Drawer>;
}

function NoUpdates({type}) {
    return <div className="bd-empty-updates">
        <Checkmark size="48px" />
        {Strings.Updater.upToDateBlankslate.format({type: type})}
    </div>;
}

function AddonUpdaterPanel({pending, type, updater, update, updateAll}) {
    const filenames = pending;
    return <Drawer name={Strings.Panels[type]} collapsible={true} button={filenames.length ? {title: Strings.Updater.updateAll, onClick: () => updateAll(type)} : null}>
        {!filenames.length && <NoUpdates type={type} />}
        {filenames.map(f => {
            const info = updater.cache[f];
            const addon = updater.manager.addonList.find(a => a.filename === f);
            return <SettingItem name={`${addon.name} v${addon.version}`} note={Strings.Updater.versionAvailable.format({version: info.version})} inline={true} id={addon.name}>
                    <button className="bd-button" onClick={() => update(type, f)}>{Strings.Updater.updateButton}</button>
                </SettingItem>;
    })}
    </Drawer>;
}

export default function UpdaterPanel({coreUpdater, pluginUpdater, themeUpdater}) {
    const [hasCoreUpdate, setCoreUpdate] = useState(coreUpdater.hasUpdate);
    const [updates, setUpdates] = useState({plugins: pluginUpdater.pending.slice(0), themes: themeUpdater.pending.slice(0)});

    const checkAddons = useCallback(async (type) => {
        const updater = type === "plugins" ? pluginUpdater : themeUpdater;
        await updater.checkAll(false);
        setUpdates({...updates, [type]: updater.pending.slice(0)});
    }, [updates, pluginUpdater, themeUpdater]);

    const update = useCallback(() => {
        checkAddons("plugins");
        checkAddons("themes");
    }, [checkAddons]);

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
    }, [update]);

    const checkCoreUpdate = useCallback(async () => {
        await coreUpdater.checkForUpdate(false);
        setCoreUpdate(coreUpdater.hasUpdate);
    }, [coreUpdater]);

    const checkForUpdates = useCallback(async () => {
        Toasts.info(Strings.Updater.checking);
        await checkCoreUpdate();
        await checkAddons("plugins");
        await checkAddons("themes");
        Toasts.info(Strings.Updater.finishedChecking);
    }, [checkAddons, checkCoreUpdate]);

    const updateCore = useCallback(async () => {
        await coreUpdater.update();
        setCoreUpdate(false);
    }, [coreUpdater]);

    const updateAddon = useCallback(async (type, filename) => {
        const updater = type === "plugins" ? pluginUpdater : themeUpdater;
        await updater.updateAddon(filename);
        setUpdates(prev => {
            prev[type].splice(prev[type].indexOf(filename), 1);
            return prev;
        });
    }, [pluginUpdater, themeUpdater]);

    const updateAllAddons = useCallback(async (type) => {
        const toUpdate = updates[type].slice(0);
        for (const filename of toUpdate) {
            await updateAddon(type, filename);
        }
    }, [updateAddon, updates]);

    return [
        <SettingsTitle text={Strings.Panels.updates} button={{title: Strings.Updater.checkForUpdates, onClick: checkForUpdates}} />,
        <CoreUpdaterPanel remoteVersion={coreUpdater.remoteVersion} hasUpdate={hasCoreUpdate} update={updateCore} />,
        <AddonUpdaterPanel type="plugins" pending={updates.plugins} update={updateAddon} updateAll={updateAllAddons} updater={pluginUpdater} />,
        <AddonUpdaterPanel type="themes" pending={updates.themes} update={updateAddon} updateAll={updateAllAddons} updater={themeUpdater} />,
    ];
}