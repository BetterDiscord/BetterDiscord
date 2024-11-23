import React from "@modules/react";
import AddonStorePage from "./addonstore";
import AddonList from "./addonlist";
import Settings from "@modules/settingsmanager";
import {addonContext} from "./addonshared";
// import addonStore from "@modules/addonstore";

const {useState, useCallback} = React;

export default function AddonPage(props) {
    // If 0 addons installed open the store automatically
    const [showStore, setShowStore] = useState(() => Settings.get("settings", "store", "bdAddonStore") && props.addonList.length === 0);

    const toggleStore = useCallback(() => setShowStore(v => !v), []);

    // addonStore.getStore(props.prefix).initialize();

    return (
        <addonContext.Provider value={{toggleStore, showingStore: showStore, ...props}}>
            {showStore ? (
                <AddonStorePage {...props} />
            ) : (
                <AddonList {...props} />
            )}
        </addonContext.Provider>
    );
}