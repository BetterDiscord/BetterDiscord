import React from "@modules/react";
import AddonStore from "@modules/addonstore";

import AddonCard, {TagContext} from "@ui/settings/storecard";
import Spinner from "@ui/spinner";

const {useState, useEffect} = React;

export default function AddonEmbed({id, original}) {
    const [addon, setAddon] = useState(() => AddonStore.getAddon(id));
    const [loading, setLoading] = useState(() => true);
    const [tags, setTags] = useState({});

    useEffect(() => {
        setAddon(AddonStore.getAddon(id));
        setLoading(AddonStore.loading);

        return AddonStore.addChangeListener(() => {
            setAddon(AddonStore.getAddon(id));
            setLoading(AddonStore.loading);
        });
    }, [id]);

    if (!addon) {
        // 404 don't show
        if (!loading) return original;

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