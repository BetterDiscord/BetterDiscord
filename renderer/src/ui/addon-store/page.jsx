import React from "@modules/react";
import AddonStore from "@modules/addonstore";
import Strings from "@modules/strings";
import Discordmodules from "@modules/discordmodules";
import ipc from "@modules/ipc";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";

import Button from "@ui/base/button";
import Folder from "@ui/icons/folder";
import AddonCard from "./card";
import SettingsTitle from "@ui/settings/title";
import Globe from "@ui/icons/globe";
import Search from "@ui/settings/components/search";
import Dropdown from "@ui/settings/components/dropdown";
import DataStore from "@modules/datastore";
import MultiSelect from "../settings/components/multiselect";
import NoResults from "@ui/blankslates/noresults";
import Spinner from "@ui/spinner";
import ErrorBoundary from "@ui/errorboundary";
import Web from "@data/web";

const {useState, useEffect, useMemo, useCallback, createContext} = React;

function makeBasicButton(title, children, action) {
    return <Discordmodules.Tooltip color="primary" position="top" text={title}>
        {(props) => <Button {...props} size={Button.Sizes.NONE} look={Button.Looks.BLANK} className="bd-button" onClick={action}>{children}</Button>}
    </Discordmodules.Tooltip>;
}

function getState(type, control, defaultValue) {
    const addonlistControls = DataStore.getBDData("addonlistControls") || {};
    if (!addonlistControls[type]) return defaultValue;
    if (!addonlistControls[type].hasOwnProperty(control)) return defaultValue;
    return addonlistControls[type][control];
}
function saveState(type, control, value) {
    const addonlistControls = DataStore.getBDData("addonlistControls") || {};
    if (!addonlistControls[type]) addonlistControls[type] = {};
    addonlistControls[type][control] = value;
    DataStore.setBDData("addonlistControls", addonlistControls);
}

const buildSortOptions = () => [
    {label: Strings.Addons.popularity, value: "popularity"},
    {label: Strings.Addons.name, value: "name"},
    {label: Strings.Addons.author, value: "author"},
    {label: Strings.Addons.version, value: "version"},
    {label: Strings.Addons.modified, value: "modified"},
    {label: Strings.Addons.isInstalled, value: "isInstalled"},
    {label: Strings.Addons.likes, value: "likes"},
    {label: Strings.Addons.downloads, value: "downloads"}
];

const buildDirectionOptions = () => [
    {label: Strings.Sorting.ascending, value: true},
    {label: Strings.Sorting.descending, value: false}
];

export const TagContext = createContext();

/**
 * 
 * @param {{type: "plugins"|"themes", title: string, closeStore(): void}} param0 
 */
export default function AddonStorePage({type, title, closeStore}) {
    AddonStore.initializeIfNeeded();

    const [ tags, setTags ] = useState(() => Web.store.tags[type].map((tag) => ({
        selected: false,
        value: tag,
        label: tag
    })));

    /**
     * @type {[ import("@modules/addonstore").RawAddon[], (addons: import("@modules/addonstore").RawAddon[]) => void ]}
     */
    const [ addons, setAddons ] = useState(() => [...AddonStore.addonList]);
    const [ query, setQuery ] = useState("");

    const search = useCallback((event) => {
        setQuery(event.target.value.toLocaleLowerCase());
    }, []);

    const [sort, setSort] = useState(() => getState(`${type}-store`, "sort", "popularity"));
    const [ascending, setAscending] = useState(() => getState(`${type}-store`, "ascending", true));
    
    const changeDirection = useCallback((value) => {
        saveState(`${type}-store`, "ascending", value);
        setAscending(value);
    }, [type]);

    const changeSort = useCallback((value) => {
        saveState(`${type}-store`, "sort", value);
        setSort(value);
    }, [type]);


    useEffect(() => {
        setAddons([...AddonStore.addonList]);

        const listener = () => {
            setAddons([...AddonStore.addonList]);
        };

        return AddonStore.addChangeListener(listener);
    }, []);

    /**
     * @type {import("@modules/addonstore").RawAddon[]}
     */
    const filtered = useMemo(() => {
        const $query = query.toLowerCase();

        const $tags = tags.filter(tag => tag.selected);        

        return addons.filter((addon) => {
            if (addon.type !== type) return false;
            if (!(addon.name.toLowerCase().includes($query) || addon.author.display_name.toLowerCase().includes($query) || addon.description.toLowerCase().includes($query))) return false;

            return $tags.every((tag) => addon.tags.includes(tag.value));
        });
    }, [type, addons, query, tags]);

    const content = useMemo(() => {
        if (!addons.length) {            
            return (
                <div className="bd-addon-store-center">
                    <Spinner type={Spinner.Type.WANDERING_CUBES} />
                </div>
            );
        }
        if (!filtered.length) {
            return (
                <div className="bd-addon-store-center">
                    <NoResults />
                </div>
            );
        }

        const $addons = filtered.concat().sort((a, b) => {
            let comparison = 0;

            if (sort === "popularity") {
              comparison = (b.downloads * 0.7 + b.likes * 0.3) - (a.downloads * 0.7 + a.likes * 0.3);
            } 
            else if (sort === "name") {
              comparison = a.name.localeCompare(b.name);
            } 
            else if (sort === "author") {
              comparison = a.author.display_name.localeCompare(b.author.display_name);
            } 
            else if (sort === "version") {
              comparison = a.version.localeCompare(b.version);
            } 
            else if (sort === "modified") {
              comparison = new Date(b.release_date) - new Date(a.release_date);
            } 
            else if (sort === "isInstalled") {
              comparison = (a.isInstalled === b.isInstalled) ? 0 : (a.isInstalled ? -1 : 1);
            }
            else if (sort === "likes") {
                comparison = b.likes - a.likes;
            }
            else if (sort === "downloads") {
                comparison = b.downloads - a.downloads;
            }
        
            return ascending ? comparison : -comparison; // Adjust for ascending/descending
        });
        
        const cards = $addons.map((addon) => (
            <ErrorBoundary key={addon.id}><AddonCard addon={addon} /></ErrorBoundary>
        ));

        return cards;
    }, [addons, filtered, ascending, sort]);

    /** @type {typeof ThemeManager | typeof PluginManager} */
    const manager = useMemo(() => type === "plugin" ? PluginManager : ThemeManager, [type]);

    const toggleTag = useCallback((tag, value) => {
        setTags(($tags) => {
            const index = $tags.findIndex(t => t.value === tag);

            return [
                ...$tags.slice(0, index),
                {...$tags[index], selected: value ?? !$tags[index].selected},
                ...$tags.slice(index + 1)
            ];
        });
    }, []);
    

    return [
        <SettingsTitle text={title} key="title">
            <Search onChange={search} placeholder={`${Strings.Addons.search.format({type: `${filtered.length} ${title}`})}...`} />
        </SettingsTitle>,
        <div className="bd-controls bd-addon-controls">
            <div className="bd-controls-basic">
                {makeBasicButton(Strings.Addons.website, <Globe />, closeStore)}
                {makeBasicButton(Strings.Addons.website, <Globe />, () => window.open(Web.pages[manager.prefix]()))}
                {makeBasicButton(Strings.Addons.openFolder.format({type: title}), <Folder />, () => ipc.openPath(manager.addonFolder))}
            </div>
            <div className="bd-controls-advanced">
                <div className="bd-addon-dropdowns">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Addons.tags}:</label>
                        <MultiSelect 
                            options={tags} 
                            onChange={toggleTag} 
                            style="transparent"
                        />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.sortBy}:</label>
                        <Dropdown options={buildSortOptions()} value={sort} onChange={changeSort} style="transparent" />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.order}:</label>
                        <Dropdown options={buildDirectionOptions()} value={ascending} onChange={changeDirection} style="transparent" />
                    </div>
                </div>
                {/* <div className="bd-addon-views">
                    {makeControlButton(Strings.Addons.listView, <ListIcon />, listView, view === "list")}
                    {makeControlButton(Strings.Addons.gridView, <GridIcon />, gridView, view === "grid")}
                </div> */}
            </div>
        </div>,
        <div key="content" className="bd-addon-store">
            <TagContext.Provider 
                value={[ 
                    (tag) => tags.find(t => t.value === tag).selected, 
                    toggleTag 
                ]}
            >
                {content}
            </TagContext.Provider>
        </div>
    ];
}