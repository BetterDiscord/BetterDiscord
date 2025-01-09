import React from "@modules/react";
import AddonStorePage from "./addonstore";
import AddonList from "./addonlist";
import Settings from "@modules/settingsmanager";
import {addonContext} from "./addonshared";

const {useState, useCallback} = React;

export default function AddonPage(props) {
    // If 0 addons installed open the store automatically
    const [showStore, setShowStore] = useState(() => Settings.get("settings", "store", "bdAddonStore") && !props.addonList.length);

    const toggleStore = useCallback(() => setShowStore(v => !v), []);

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