import React from "@modules/react";
import AddonStore from "@modules/addonstore";
import Strings from "@modules/strings";
import ipc from "@modules/ipc";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";

import Folder from "@ui/icons/folder";
import AddonCard, {TagContext} from "@ui/settings/storecard";
import Search from "@ui/settings/components/search";
import Dropdown from "@ui/settings/components/dropdown";
import NoResults from "@ui/blankslates/noresults";
import Spinner from "@ui/spinner";
import ErrorBoundary from "@ui/errorboundary";
import Web from "@data/web";
import {buildDirectionOptions, makeBasicButton, getState, saveState, AddonHeader} from "./addonshared";
import Paginator from "@ui/misc/paginator";
import Info from "@ui/icons/info";
import ReloadIcon from "@ui/icons/reload";
import Arrow from "@ui/icons/downarrow";
import Logger from "@common/logger";

const {useState, useMemo, useCallback} = React;

const buildSortOptions = () => [
    {label: Strings.Addons.downloads, value: "downloads"},
    // {label: Strings.Addons.popularity, value: "popularity"},
    {label: Strings.Addons.name, value: "name"},
    {label: Strings.Addons.author, value: "author"},
    {label: Strings.Addons.version, value: "version"},
    {label: Strings.Addons.lastUpdated, value: "modified"},
    {label: Strings.Addons.releaseDate, value: "releaseDate"},
    {label: Strings.Addons.isInstalled, value: "isInstalled"},
    {label: Strings.Addons.likes, value: "likes"}
];

const MAX_AMOUNT_OF_CARDS = 30;

function StoreContent({content, refToScroller, page, setPage}) {
    const cards = useMemo(() => content.slice(page * MAX_AMOUNT_OF_CARDS, (page + 1) * MAX_AMOUNT_OF_CARDS), [content, page]);

    return (
        <div className="bd-addon-store-wrapper">
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

function TagDropdown({type, selected, onChange}) {
    const hideMenu = useCallback(() => {
        setOpen(false);
        document.removeEventListener("click", hideMenu);
    }, []);

    const [open, setOpen] = useState(false);
    const showMenu = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!open) {
            setOpen(true);
            document.addEventListener("click", hideMenu);
            return;
        }
        
        setOpen(event.shiftKey);
    }, [hideMenu, open]);

    const tags = useMemo(() => Web.store.tags[type], [type]);

    const selectedTags = useMemo(() => Object.entries(selected).filter(([, value]) => value).map(([ key ]) => key), [selected]);

    return (
        <div className={`bd-select bd-select-transparent${open ? " menu-open" : ""}`} onClick={showMenu}>
            <div className="bd-select-value">{selectedTags.length}/{tags.length}</div>
            <Arrow className="bd-select-arrow" />
            {open && (
                <div className="bd-select-options">
                    {tags.map((tag, index) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                            <div 
                                className={`bd-select-option${isSelected ? " selected" : ""}`} 
                                onClick={() => onChange(tag)}
                                key={index}
                            >
                                <input type="checkbox" checked={isSelected} />
                                {tag}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/**
 * @param {{type: "plugin"|"theme", title: string, refToScroller: any}} param0 
 */
export default function AddonStorePage({type, title, refToScroller}) {
    const {error, addons, loading} = AddonStore.useState();

    const [page, setPage] = useState(0);

    /** @type {[ tags: Record<string, boolean>, setTags: (value: ((tags: Record<string, boolean>) => Record<string, boolean>) | Record<string, boolean>) => void ]} */
    const [tags, setTags] = useState({});

    /** @type {(tag: string, value?: boolean) => void} */
    const toggleTag = useCallback((tag, value) => {
        setPage(0);        

        setTags(($tags) => ({
            ...$tags,
            [tag]: value ?? !$tags[tag]
        }));
    }, []);    

    const [query, setQuery] = useState("");

    const search = useCallback((event) => {
        setQuery(event.target.value.toLocaleLowerCase());
        setPage(0);
    }, []);

    const [sort, setSort] = useState(() => getState(`${type}-store`, "sort", "downloads"));
    const [ascending, setAscending] = useState(() => getState(`${type}-store`, "ascending", true));
    
    const changeDirection = useCallback((value) => {
        saveState(`${type}-store`, "ascending", value);
        setAscending(value);
    }, [type]);

    const changeSort = useCallback((value) => {
        saveState(`${type}-store`, "sort", value);
        setSort(value);
    }, [type]);

    /**
     * @type {import("@modules/addonstore").Addon[]}
     */
    const filtered = useMemo(() => {
        const $query = query.toLowerCase();

        return addons.filter((addon) => {
            if (addon.type !== type) return false;
            if (!(addon.name.toLowerCase().includes($query) || addon.author.toLowerCase().includes($query) || addon.description.toLowerCase().includes($query))) return false;

            return Object.entries(tags).every(([tag, value]) => value ? addon.tags.includes(tag) : true);
        });
    }, [type, addons, query, tags]);

    const content = useMemo(() => {
        if (loading) {            
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

            switch (sort) {
                case "author":
                case "version":
                    comparison = a[sort].localeCompare(b[sort]);
                    break;
                case "likes":
                case "downloads":
                    comparison = b[sort] - a[sort];
                    break;
                case "isInstalled":
                    comparison = (a.isInstalled() === b.isInstalled()) ? 0 : (a.isInstalled() ? -1 : 1);
                    break;
                case "modified":
                    comparison = b.lastModified - a.lastModified;
                    break;
                case "releaseDate":
                    comparison = b.releaseDate - a.releaseDate;
                    break;
                case "name":
                    break;
                // case "popularity":
                //     comparison = (b.downloads * 0.7 + b.likes * 0.3) - (a.downloads * 0.7 + a.likes * 0.3);
                //     break;
                default:
                    Logger.warn("AddonStore", `Sorting method '${sort}' is unknown`);
                    break;
            }

            if (comparison === 0 || isNaN(comparison)) comparison = a.name.localeCompare(b.name);
        
            return ascending ? comparison : -comparison; // Adjust for ascending/descending
        });
        
        const cards = $addons.map((addon) => (
            <ErrorBoundary key={addon.id}><AddonCard addon={addon} /></ErrorBoundary>
        ));

        return <StoreContent content={cards} refToScroller={refToScroller} setPage={setPage} page={page} />;
    }, [filtered, ascending, sort, setPage, page, refToScroller, loading]);

    /** @type {typeof ThemeManager | typeof PluginManager} */
    const manager = useMemo(() => type === "plugin" ? PluginManager : ThemeManager, [type]);

    return [
        <AddonHeader key="title" count={filtered.length} searching={query.length !== 0}>
            <Search onChange={search} placeholder={`${Strings.Addons.search.format({type: `${filtered.length} ${title}`})}...`} />
        </AddonHeader>,
        <div className="bd-controls bd-addon-controls">
            <div className="bd-controls-basic">
                {/* {makeBasicButton(Strings.Addons.website, <Globe />, () => window.open(Web.pages[`${manager.prefix}s`]))} */}
                {makeBasicButton(Strings.Addons.openFolder.format({type: title}), <Folder />, () => ipc.openPath(manager.addonFolder), "folder")}
                {makeBasicButton(Strings.Addons.reload, <ReloadIcon size={20} />, () => loading ? {} : AddonStore.requestAddons(), "reload")}
            </div>
            <div className="bd-controls-advanced">
                <div className="bd-addon-dropdowns">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Addons.tags}:</label>
                        <TagDropdown 
                            type={type}
                            selected={tags} 
                            onChange={toggleTag} 
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
        (!loading && error) && (
            <div className="bd-addon-store-warning">
                <Info size={24} />
                <div>
                    <div>{Strings.Addons.failedToFetch}</div>
                    <div>{error.message}</div>
                </div>
            </div>
        ),
        <TagContext.Provider 
            value={[ 
                (tag) => !!tags[tag], 
                toggleTag 
            ]}
        >{content}</TagContext.Provider>
    ];
}