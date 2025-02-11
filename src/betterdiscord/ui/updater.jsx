import Config from "@stores/config";

import React from "@modules/react";
import Strings from "@modules/strings";
import Events from "@modules/emitter";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import Drawer from "@ui/settings/drawer";
import SettingItem from "@ui/settings/components/item";
import SettingsTitle from "@ui/settings/title";
import Toasts from "@ui/toasts";

import {ArrowDownToLineIcon, CheckIcon, RefreshCwIcon, RotateCwIcon} from "lucide-react";


const {useState, useCallback, useEffect} = React;

function makeButton(tooltip, children, action, options = {}) {
    const {size = Button.Sizes.ICON, look = Button.Looks.BLANK, color = Button.Colors.TRANSPARENT, className = "", stopAnimation = false} = options;

    const onClick = async (event) => {
        const button = event.target.closest("button");
        button.classList.add("animate");
        await action();

        if (!stopAnimation) return;
        await new Promise(r => setTimeout(r, 500)); // Allow animation to complete at least once.
        button?.classList?.remove("animate"); // Stop animation if it hasn't been removed from the DOM
    };

    return <DiscordModules.Tooltip color="primary" position="top" text={tooltip}>
        {(props) => <Button {...props} aria-label={tooltip} className={`bd-update-button ${className}`} size={size} look={look} color={color} onClick={onClick}>{children}</Button>}
    </DiscordModules.Tooltip>;
}

function CoreUpdaterPanel({hasUpdate, remoteVersion, update}) {
    return <Drawer name="BetterDiscord" collapsible={true}>
        <SettingItem name={`Core v${Config.get("version")}`} note={hasUpdate ? Strings.Updater.versionAvailable.format({version: remoteVersion}) : Strings.Updater.noUpdatesAvailable} inline={true} id={"core-updater"}>
            {!hasUpdate && <div className="bd-filled-checkmark"><CheckIcon size="18px" /></div>}
            {hasUpdate && makeButton(Strings.Updater.updateButton, <ArrowDownToLineIcon />, update, {className: "no-animation"})}
        </SettingItem>
    </Drawer>;
}

function NoUpdates({type}) {
    return <div className="bd-empty-updates">
        <CheckIcon size="48px" />
        {Strings.Updater.upToDateBlankslate.format({type: type})}
    </div>;
}

function AddonUpdaterPanel({pending, type, updater, update, updateAll}) {
    const filenames = pending;
    return <Drawer
        name={Strings.Panels[type]}
        collapsible={true}
        titleChildren={filenames.length > 1 ? makeButton(Strings.Updater.updateAll, <RotateCwIcon size="20px" />, () => updateAll(type)) : null}>
        {!filenames.length && <NoUpdates type={type} />}
        {filenames.map(f => {
            const info = updater.cache[f];
            const addon = updater.manager.addonList.find(a => a.filename === f);
            return <SettingItem name={`${addon.name} v${addon.version}`} note={Strings.Updater.versionAvailable.format({version: info.version})} inline={true} id={addon.name}>
                {makeButton(Strings.Updater.updateButton, <RotateCwIcon />, () => update(type, f))}
                {/* <Button size={Button.Sizes.SMALL} onClick={() => update(type, f)}>{Strings.Updater.updateButton}</Button> */}
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
        setUpdates({
            plugins: pluginUpdater.pending.slice(0),
            themes: themeUpdater.pending.slice(0)
        });
        Toasts.info(Strings.Updater.finishedChecking);
    }, [checkAddons, checkCoreUpdate, pluginUpdater, themeUpdater]);

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
        <SettingsTitle text={Strings.Panels.updates}>
            {makeButton(Strings.Updater.checkForUpdates, <RefreshCwIcon />, checkForUpdates, {className: "bd-update-check", stopAnimation: true})}
        </SettingsTitle>,
        <CoreUpdaterPanel remoteVersion={coreUpdater.remoteVersion} hasUpdate={hasCoreUpdate} update={updateCore} />,
        <AddonUpdaterPanel type="plugins" pending={updates.plugins} update={updateAddon} updateAll={updateAllAddons} updater={pluginUpdater} />,
        <AddonUpdaterPanel type="themes" pending={updates.themes} update={updateAddon} updateAll={updateAllAddons} updater={themeUpdater} />,
    ];
}