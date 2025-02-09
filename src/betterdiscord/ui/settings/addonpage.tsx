import React from "@modules/react";
import AddonStorePage from "./addonstore";
import AddonList from "./addonlist";
import Settings from "@stores/settings";
import {addonContext} from "./addonshared";

const {useState, useCallback} = React;

export function getAddonPanel(title: string, options = {}) {
    return (props: any) => React.createElement(AddonPage, Object.assign({}, {
        title: title,
        ...props
    }, options));
}

export default function AddonPage(props: any) {
    // If 0 addons installed open the store automatically
    const [showStore, setShowStore] = useState(() => Settings.get("settings", "store", "bdAddonStore") && !props.store.addonList.length);

    const toggleStore = useCallback(() => setShowStore((v: boolean) => !v), []);

    return (
        <addonContext.Provider value={{toggleStore, showingStore: showStore, ...props}}>
            {showStore ? (
                <AddonStorePage {...props} type={props.store.prefix} />
            ) : (
                <AddonList {...props} />
            )}
        </addonContext.Provider>
    );
}