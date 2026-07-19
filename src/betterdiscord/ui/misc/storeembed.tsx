import React, {useState, type ReactNode} from "react";
import AddonStore from "@modules/addonstore";

import AddonCard, {TagContext} from "@ui/settings/storecard";
import Spinner from "@ui/spinner";
import {useStateFromStores} from "@ui/hooks";

export default function AddonEmbed({id, original}: {id: string; original?: ReactNode;}) {
    const addon = useStateFromStores(AddonStore, () => AddonStore.getAddon(id), [id], true);
    const loading = useStateFromStores(AddonStore, () => AddonStore.loading, []);

    const [tags, setTags] = useState<Record<string, boolean>>({});

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