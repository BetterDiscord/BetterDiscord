import React from "@modules/react";
import AddonStore from "@modules/addonstore";
import Strings from "@modules/strings";
import ipc from "@modules/ipc";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";

import Folder from "@ui/icons/folder";
import AddonCard, {TagContext} from "../addon-store/card";
import SettingsTitle from "@ui/settings/title";
import Globe from "@ui/icons/globe";
import Search from "@ui/settings/components/search";
import Dropdown from "@ui/settings/components/dropdown";
import MultiSelect from "./components/multiselect";
import NoResults from "@ui/blankslates/noresults";
import Spinner from "@ui/spinner";
import ErrorBoundary from "@ui/errorboundary";
import Web from "@data/web";
import {buildDirectionOptions, makeBasicButton, getState, saveState} from "./addonshared";
import Paginator from "@ui/misc/paginator";

const {useState, useEffect, useMemo, useCallback} = React;

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

const MAX_AMOUNT_OF_CARDS = 30;

function Cards({content, refToScroller, page, setPage}) {
    const cards = useMemo(() => content.slice(page * MAX_AMOUNT_OF_CARDS, (page + 1) * MAX_AMOUNT_OF_CARDS), [content, page]);

    return (
        <div className="bd-addon-wrapper">
            <div className="bd-addon-store">
                {cards}
            </div>
            <Paginator 
                currentPage={page}
                length={content.length}
                pageSize={MAX_AMOUNT_OF_CARDS}
                maxVisible={9}
                onPageChange={($page) => {                    
                    setPage($page);
                    
                    /** @type {HTMLDivElement} */
                    const node = refToScroller?.current?.getScrollerNode();
                    if (!node) return;                    

                    node.scrollTo({top: 0, behavior: "smooth"});
                }}
            />
        </div>
    );
}

/**
 * @param {{type: "plugin"|"theme", title: string, toggleStore(): void, refToScroller: any}} param0 
 */
export default function AddonStorePage({type, title, toggleStore, refToScroller}) {    
    AddonStore.initializeIfNeeded(type);

    const [page, setPage] = useState(0);

    const [ tags, setTags ] = useState(() => Web.store.tags[type].map((tag) => ({
        selected: false,
        value: tag,
        label: tag
    })));

    /**
     * @type {[ import("@modules/addonstore").Addon[], (addons: import("@modules/addonstore").Addon[]) => void ]}
     */
    const [ addons, setAddons ] = useState(() => AddonStore.getAddonsOfType(type));
    const [ query, setQuery ] = useState("");

    const search = useCallback((event) => {
        setQuery(event.target.value.toLocaleLowerCase());
        setPage(0);
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
        setAddons(AddonStore.getAddonsOfType(type));

        const listener = () => {            
            setAddons(AddonStore.getAddonsOfType(type));
        };

        return AddonStore.addChangeListener(listener);
    }, [type]);

    /**
     * @type {import("@modules/addonstore").Addon[]}
     */
    const filtered = useMemo(() => {
        const $query = query.toLowerCase();

        const $tags = tags.filter(tag => tag.selected);        

        return addons.filter((addon) => {
            if (addon.type !== type) return false;
            if (!(addon.name.toLowerCase().includes($query) || addon.author.toLowerCase().includes($query) || addon.description.toLowerCase().includes($query))) return false;

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
              comparison = a.author.localeCompare(b.author);
            } 
            else if (sort === "version") {
              comparison = a.version.localeCompare(b.version);
            } 
            else if (sort === "modified") {
              comparison = b.releaseDate - a.releaseDate;
            } 
            else if (sort === "isInstalled") {
              comparison = (a.isInstalled() === b.isInstalled()) ? 0 : (a.isInstalled() ? -1 : 1);
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

        return (
            <Cards content={cards} refToScroller={refToScroller} setPage={setPage} page={page} />
        );
    }, [addons, filtered, ascending, sort, setPage, page, refToScroller]);

    /** @type {typeof ThemeManager | typeof PluginManager} */
    const manager = useMemo(() => type === "plugin" ? PluginManager : ThemeManager, [type]);

    const toggleTag = useCallback((tag, value) => {
        setPage(0);

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
                {makeBasicButton(Strings.Addons.viewInstalled.format({type: title}), <Globe size={20} />, () => toggleStore(), "installed")}
                {/* {makeBasicButton(Strings.Addons.website, <Globe />, () => window.open(Web.pages[`${manager.prefix}s`]))} */}
                {makeBasicButton(Strings.Addons.openFolder.format({type: title}), <Folder />, () => ipc.openPath(manager.addonFolder), "folder")}
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
        <TagContext.Provider 
            value={[ 
                (tag) => tags.find(t => t.value === tag).selected, 
                toggleTag 
            ]}
        >{content}</TagContext.Provider>
    ];
}