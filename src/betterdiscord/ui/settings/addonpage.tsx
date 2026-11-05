import React, {useCallback, useLayoutEffect, useState} from "react";
import AddonStorePage from "./addonstore";
import AddonList from "./addonlist";
import AddonSettingsPage from "./addonsettings";
import {addonContext} from "./addonshared";
import AddonSettingsRoute from "@stores/addonsettings";
import {useStateFromStores} from "@ui/hooks";
import type AddonManager from "@modules/addonmanager";

export default function AddonPage(props: {title: string; store: AddonManager;}) {
    const [showStore, setShowStore] = useState(() => !props.store.addonList.length);
    const [openedId, setOpenedId] = useState<string | null>(() => {
        if (AddonSettingsRoute.prefix !== props.store.prefix || !AddonSettingsRoute.id) return null;
        return props.store.addonList.some(addon => addon.id === AddonSettingsRoute.id) ? AddonSettingsRoute.id : null;
    });
    const pendingStore = useStateFromStores([AddonSettingsRoute], () => AddonSettingsRoute.pendingStore === props.store.prefix);
    const pendingSettings = useStateFromStores([AddonSettingsRoute], () => AddonSettingsRoute.prefix === props.store.prefix ? AddonSettingsRoute.id : null);
    const toggleStore = useCallback(() => setShowStore((value: boolean) => !value), []);
    const closeSettings = useCallback(() => setOpenedId(null), []);
    const showingStore = showStore || pendingStore;

    const [seenSettings, setSeenSettings] = useState<string | null>(null);
    if (pendingSettings !== seenSettings) {
        setSeenSettings(pendingSettings);
        if (pendingSettings && props.store.addonList.some(addon => addon.id === pendingSettings)) {
            setOpenedId(pendingSettings);
            setShowStore(false);
        }
    }

    const [seenStore, setSeenStore] = useState(false);
    if (pendingStore !== seenStore) {
        setSeenStore(pendingStore);
        if (pendingStore) {
            setOpenedId(null);
            setShowStore(true);
        }
    }

    useLayoutEffect(() => {
        if (pendingSettings) AddonSettingsRoute.close();
    }, [pendingSettings]);

    useLayoutEffect(() => {
        if (pendingStore) AddonSettingsRoute.consumeStore(props.store.prefix);
    }, [pendingStore, props.store.prefix]);

    return (
        <addonContext.Provider value={{toggleStore, closeSettings, showingStore, ...props}}>
            {openedId ? (
                <AddonSettingsPage key={openedId} addonId={openedId} />
            ) : showingStore ? (
                <AddonStorePage key="store" {...props} type={props.store.prefix} />
            ) : (
                <AddonList key="list" {...props} />
            )}
        </addonContext.Provider>
    );
}
