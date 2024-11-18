import React from "@modules/react";
import AddonStorePage from "./addonstore";
import AddonList from "./addonlist";

const {useState, useCallback} = React;

export default function AddonPage(props) {
    // If 0 addons installed open the store automatically
    const [showStore, setShowStore] = useState(() => props.addonList.length === 0);

    const toggleStore = useCallback(() => setShowStore(v => !v), []);

    if (showStore) return <AddonStorePage {...props} toggleStore={setShowStore} />;
    return <AddonList {...props} toggleStore={toggleStore} />;
}