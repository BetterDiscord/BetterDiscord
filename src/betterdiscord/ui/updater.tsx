import Config from "@stores/config";
import Toasts from "@stores/toasts";

import React from "@modules/react";
import {t} from "@common/i18n";
import Events from "@modules/emitter";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import Drawer from "@ui/settings/drawer";
import SettingItem from "@ui/settings/components/item";
import SettingsTitle from "@ui/settings/title";

import {ArrowDownToLineIcon, CheckIcon, RefreshCwIcon, RotateCwIcon} from "lucide-react";
import type {CoreUpdater, ThemeUpdater, PluginUpdater, AddonUpdater} from "@modules/updater";
import type {MouseEvent, ReactNode} from "react";
import {SettingsTitleContext} from "./settings";


const {useState, useCallback, useEffect} = React;

interface ButtonOptions {
    size?: typeof Button.Sizes[keyof typeof Button.Sizes];
    look?: typeof Button.Looks[keyof typeof Button.Looks];
    color?: typeof Button.Colors[keyof typeof Button.Colors];
    className?: string;
    stopAnimation?: boolean;
}
function makeButton(tooltip: string, children: ReactNode, action: () => Promise<void>, options: ButtonOptions = {}) {
    const {size = Button.Sizes.ICON, look = Button.Looks.BLANK, color = Button.Colors.TRANSPARENT, className = "", stopAnimation = false} = options;

    const onClick = async (event: MouseEvent) => {
        const button = event.currentTarget.closest("button")!;
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

function CoreUpdaterPanel({hasUpdate, remoteVersion, update}: {hasUpdate: boolean; remoteVersion: string; update: () => Promise<void>;}) {
    return <Drawer name="BetterDiscord" collapsible={true}>
        <SettingItem name={`Core v${Config.get("version")}`} note={hasUpdate ? t("Updater.versionAvailable", {version: remoteVersion}) : t("Updater.noUpdatesAvailable")} inline={true} id={"core-updater"}>
            {!hasUpdate && <div className="bd-filled-checkmark"><CheckIcon size="18px" /></div>}
            {hasUpdate && makeButton(t("Updater.updateButton"), <ArrowDownToLineIcon />, update, {className: "no-animation"})}
        </SettingItem>
    </Drawer>;
}

function NoUpdates({type}: {type: "plugins" | "themes";}) {
    return <div className="bd-empty-updates">
        <CheckIcon size="48px" />
        {t("Updater.upToDateBlankslate", {context: type.slice(0, -1)})}
    </div>;
}

function AddonUpdaterPanel({pending, type, updater, update, updateAll}: {pending: string[]; type: "plugins" | "themes"; updater: AddonUpdater; update: (at: "plugins" | "themes", f: string) => Promise<void>; updateAll: (at: "plugins" | "themes") => Promise<void>;}) {
    const filenames = pending;
    return <Drawer
        name={t(`Panels.${type}`)}
        collapsible={true}
        titleChildren={filenames.length > 1 ? makeButton(t("Updater.updateAll"), <RotateCwIcon size="20px" />, () => updateAll(type)) : null}>
        {!filenames.length && <NoUpdates type={type} />}
        {filenames.map(f => {
            const info = updater.cache[f];
            const addon = updater.manager.addonList.find(a => a.filename === f)!;
            return <SettingItem name={`${addon.name} v${addon.version}`} note={t("Updater.versionAvailable", {version: info.version})} inline={true} id={addon.name}>
                {makeButton(t("Updater.updateButton"), <RotateCwIcon />, () => update(type, f))}
                {/* <Button size={Button.Sizes.SMALL} onClick={() => update(type, f)}>{t("Updater.updateButton")}</Button> */}
            </SettingItem>;
        })}
    </Drawer>;
}

export default function UpdaterPanel({coreUpdater, pluginUpdater, themeUpdater}: {coreUpdater: typeof CoreUpdater; pluginUpdater: typeof PluginUpdater; themeUpdater: typeof ThemeUpdater;}) {
    const [hasCoreUpdate, setCoreUpdate] = useState(coreUpdater.hasUpdate);
    const [updates, setUpdates] = useState({plugins: pluginUpdater.pending.slice(0), themes: themeUpdater.pending.slice(0)});

    const checkAddons = useCallback(async (type: "plugins" | "themes") => {
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
        Toasts.info(t("Updater.checking"));
        await checkCoreUpdate();
        await checkAddons("plugins");
        await checkAddons("themes");
        setUpdates({
            plugins: pluginUpdater.pending.slice(0),
            themes: themeUpdater.pending.slice(0)
        });
        Toasts.info(t("Updater.finishedChecking"));
    }, [checkAddons, checkCoreUpdate, pluginUpdater, themeUpdater]);

    const updateCore = useCallback(async () => {
        await coreUpdater.update();
        setCoreUpdate(false);
    }, [coreUpdater]);

    const updateAddon = useCallback(async (type: "plugins" | "themes", filename: string) => {
        const updater = type === "plugins" ? pluginUpdater : themeUpdater;
        await updater.updateAddon(filename);
        setUpdates(prev => {
            prev[type].splice(prev[type].indexOf(filename), 1);
            return prev;
        });
    }, [pluginUpdater, themeUpdater]);

    const updateAllAddons = useCallback(async (type: "plugins" | "themes") => {
        const toUpdate = updates[type].slice(0);
        for (const filename of toUpdate) {
            await updateAddon(type, filename);
        }
    }, [updateAddon, updates]);

    const set = React.useContext(SettingsTitleContext);

    return [
        set(
            <SettingsTitle text={t("Panels.updates")}>
                {makeButton(t("Updater.checkForUpdates"), <RefreshCwIcon />, checkForUpdates, {className: "bd-update-check", stopAnimation: true})}
            </SettingsTitle>
        ),
        <CoreUpdaterPanel remoteVersion={coreUpdater.remoteVersion} hasUpdate={hasCoreUpdate} update={updateCore} />,
        <AddonUpdaterPanel type="plugins" pending={updates.plugins} update={updateAddon} updateAll={updateAllAddons} updater={pluginUpdater} />,
        <AddonUpdaterPanel type="themes" pending={updates.themes} update={updateAddon} updateAll={updateAllAddons} updater={themeUpdater} />,
    ];
}