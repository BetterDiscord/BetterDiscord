import React from "@modules/react";
import AddonStorePage from "./addonstore";
import AddonList from "./addonlist";
import Settings from "@modules/settingsmanager";

const {useState, useCallback} = React;

export default function AddonPage(props) {
    // If 0 addons installed open the store automatically
    const [showStore, setShowStore] = useState(() => Settings.get("settings", "store", "bdAddonStore") && props.addonList.length === 0);

    const toggleStore = useCallback(() => setShowStore(v => !v), []);

    if (showStore) return <AddonStorePage {...props} toggleStore={setShowStore} />;
    return <AddonList {...props} toggleStore={toggleStore} />;
}