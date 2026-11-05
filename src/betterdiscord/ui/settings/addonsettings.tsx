import Logger from "@common/logger";
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode} from "react";
import {t} from "@common/i18n";
import {ChevronRightIcon} from "lucide-react";
import SimpleMarkdown from "@structs/markdown";
import Toasts from "@stores/toasts";
import Modals from "@ui/modals";
import ErrorBoundary from "@ui/errorboundary";
import Text from "@ui/base/text";
import SettingsTitle from "@ui/settings/title";
import {useStateFromStores} from "@ui/hooks";
import {SettingsTitleContext} from "@ui/settings";
import {addonContext, addonText, authorByline} from "./addonshared";
import type {Plugin} from "@modules/pluginmanager";

function sameSnapshot(left: {addon: Plugin; instance: Plugin["instance"];} | null, right: {addon: Plugin; instance: Plugin["instance"];} | null) {
    return left?.addon === right?.addon && left?.instance === right?.instance;
}

export default function AddonSettingsPage({addonId}: {addonId: string;}) {
    const {title, store, closeSettings} = useContext(addonContext);
    const set = useContext(SettingsTitleContext);
    const snapshot = useStateFromStores(store, () => {
        const addon = store.addonList.find(entry => entry.id === addonId) as Plugin | undefined;
        if (!addon) return null;
        return {addon, instance: addon.instance};
    }, [addonId], sameSnapshot);
    const rootRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => {
        closeSettings();
    }, [closeSettings]);

    const panel = useMemo<{content: ReactNode; error: Error | null;} | null>(() => {
        if (!snapshot) return null;
        const instance = snapshot.instance;
        if (!instance || typeof instance.getSettingsPanel !== "function") return {content: null, error: new Error("No settings panel")};
        try {
            const next = instance.getSettingsPanel();
            if (next == null) return {content: null, error: new Error("No settings panel")};
            return {content: Modals.createAddonSettingsContent(next), error: null};
        }
        catch (err) {
            return {content: null, error: err instanceof Error ? err : new Error(String(err))};
        }
    }, [snapshot]);

    const titleName = snapshot ? addonText(snapshot.addon.name) : null;

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const host = root.closest("[class*='contentColumn']") ?? root.closest("[class*='panel']");
        if (!(host instanceof HTMLElement)) return;
        host.classList.add("bd-addon-settings-host");
        return () => host.classList.remove("bd-addon-settings-host");
    }, [addonId]);

    useLayoutEffect(() => {
        if (titleName == null) return;
        set(
            <SettingsTitle
                key="title"
                text={(
                    <div className="bd-addon-title" data-showing-settings="true">
                        <span onClick={close}>{title}</span>
                        <span className="bd-addon-title-current">
                            <ChevronRightIcon size="24px" />
                            <span>{titleName}</span>
                        </span>
                    </div>
                )}
            />
        );
    }, [set, close, title, titleName]);

    useEffect(() => {
        if (!snapshot) closeSettings();
    }, [snapshot, closeSettings]);

    useEffect(() => {
        if (!panel?.error || titleName == null) return;
        Toasts.show(t("Addons.settingsError", {name: titleName}), {type: "error"});
        Logger.stacktrace("Addon Settings", "Unable to get settings panel for " + titleName + ".", panel.error);
    }, [panel, titleName]);

    if (!snapshot) return null;

    const {addon} = snapshot;
    const name = addonText(addon.name);
    const version = addonText(addon.version);
    const author = addonText(addon.author);
    const description = addonText(addon.description);
    const authorNode = addon.authorLink
        ? <a className="bd-link bd-link-website" href={addon.authorLink} target="_blank" rel="noopener noreferrer">{author}</a>
        : <span>{author}</span>;

    return (
        <div ref={rootRef} className="bd-addon-settings">
            <div className="bd-addon-settings-intro">
                <div className="bd-addon-settings-heading">
                    <span className="bd-addon-settings-name">{name}</span>
                    {version && <span className="bd-addon-settings-version">v{version}</span>}
                    {author && <span className="bd-addon-settings-author">{authorByline(authorNode)}</span>}
                </div>
                {description && <div className="bd-description bd-addon-settings-description">{SimpleMarkdown.parseToReact(description)}</div>}
            </div>
            <div className="bd-addon-settings-panel">
                {panel?.error
                    ? <Text color={Text.Colors.STATUS_RED}>{t("Addons.settingsError", {name})}</Text>
                    : <ErrorBoundary id={`addon-settings-${addon.id}`} name="Addon Settings">{panel?.content}</ErrorBoundary>}
            </div>
        </div>
    );
}
