import React from "@modules/react";
import AddonStore from "@modules/addonstore";
import WebpackModules from "@modules/webpackmodules";

import AddonCard from "./card";
import {TagContext} from "./page";

const {useState, useEffect} = React;

const {Spinner} = WebpackModules.getByProps("Spinner", "Tooltip");

export default function LazyAddonCard({id}) {
    AddonStore.initializeIfNeeded();

    const [ addon, setAddon ] = useState(() => AddonStore.getAddon(id));
    const [tags, setTags] = useState({});
    
    useEffect(() => {
        setAddon(AddonStore.getAddon(id));

        const listener = () => {      
            setAddon(AddonStore.getAddon(id));
        };

        return AddonStore.addChangeListener(listener);
    }, [id]);

    if (!addon) {
        return (
            <div className="bd-addon-store-card-embed bd-addon-store-card-loading">
                <Spinner type={Spinner.Type.SPINNING_CIRCLE} />
            </div>
        );
    }

    return (
        <TagContext.Provider
            value={[
                (tag) => tags[tag] === true,
                (tag, state) => setTags(($tags) => ({...$tags, [tag]: state ?? !$tags[tag]}))
            ]}
        >
            <AddonCard addon={addon} isEmbed />
        </TagContext.Provider>
    );
}