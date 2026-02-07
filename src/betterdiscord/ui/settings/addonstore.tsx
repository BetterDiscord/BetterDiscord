import React from "@modules/react";
import AddonStore from "@modules/addonstore";
import {t} from "@common/i18n";
import ipc from "@modules/ipc";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";

import AddonCard, {TagContext} from "@ui/settings/storecard";
import Search from "@ui/settings/components/search";
import Dropdown from "@ui/settings/components/dropdown";
import NoResults from "@ui/blankslates/noresults";
import Spinner from "@ui/spinner";
import ErrorBoundary from "@ui/errorboundary";
import Web from "@data/web";
import {buildDirectionOptions, makeBasicButton, getState, saveState, AddonHeader} from "./addonshared";
import Paginator from "@ui/misc/paginator";
import Logger from "@common/logger";
import {ChevronDownIcon, FolderIcon, InfoIcon, RotateCwIcon} from "lucide-react";

const {useState, useMemo, useCallback} = React;

const buildSortOptions = () => [
    {label: t("Addons.downloads"), value: "downloads"},
    // {label: t("Addons.popularity"), value: "popularity"},
    {label: t("Addons.name"), value: "name"},
    {label: t("Addons.author"), value: "author"},
    {label: t("Addons.version"), value: "version"},
    {label: t("Addons.lastUpdated"), value: "modified"},
    {label: t("Addons.releaseDate"), value: "releaseDate"},
    {label: t("Addons.isInstalled"), value: "isInstalled"},
    {label: t("Addons.likes"), value: "likes"}
];

const MAX_AMOUNT_OF_CARDS = 30;

// TODO: let doggy do these types
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
    const selectRef = React.useRef<HTMLButtonElement>(null);
    const optionsRef = React.useRef<HTMLUListElement>(null);

    const tags = useMemo(() => Web.store.tags[type], [type]);
    const selectedTags = useMemo(() => Object.entries(selected).filter(([, value]) => value).map(([key]) => key), [selected]);

    React.useEffect(() => {
        const selectButton = selectRef.current;
        const optionsPopover = optionsRef.current;

        if (!selectButton || !optionsPopover) return;

        selectButton.popoverTargetElement = optionsPopover;
        selectButton.popoverTargetAction = "toggle";

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) {
                optionsPopover.togglePopover(false);
            }
        });
        observer.observe(selectButton);

        return () => {
            if (selectButton) observer.unobserve(selectButton);
        };
    }, []);

    return (
        <>
            <button
                ref={selectRef}
                type="button"
                className="bd-select bd-select-transparent"
            >
                <span className="bd-select-value">{selectedTags.length}/{tags.length}</span>
                <ChevronDownIcon className="bd-select-arrow" size="16px" />
            </button>
            <ul
                ref={optionsRef}
                popover="auto"
                role="listbox"
                className="bd-select-options bd-scroller-thin"
            >
                {tags.map((tag, index) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                        <li
                            className={`bd-select-option${isSelected ? " selected" : ""}`}
                            role="option"
                            onClick={() => onChange(tag)}
                            key={index}
                        >
                            <input type="checkbox" checked={isSelected} readOnly />
                            {tag}
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

/**
 * @param {{type: "plugin"|"theme", title: string, refToScroller: any}} param0
 */
export default function AddonStorePage({type, refToScroller}) {
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
            <Search onChange={search} placeholder={`${t("Addons.search", {count: filtered.length, context: type})}...`} />
        </AddonHeader>,
        <div className="bd-controls bd-addon-controls">
            <div className="bd-controls-basic">
                {/* {makeBasicButton(t("Addons.website"), <Globe />, () => window.open(Web.pages[`${manager.prefix}s`]))} */}
                {makeBasicButton(t("Addons.openFolder", {context: type}), <FolderIcon size="20px" />, () => ipc.openPath(manager.addonFolder), "folder")}
                {makeBasicButton(t("Addons.reload"), <RotateCwIcon size="20px" />, () => loading ? {} : AddonStore.requestAddons(), "reload")}
            </div>
            <div className="bd-controls-advanced">
                <div className="bd-addon-dropdowns">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{t("Addons.tags")}:</label>
                        <TagDropdown
                            type={type}
                            selected={tags}
                            onChange={toggleTag}
                        />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{t("Sorting.sortBy")}:</label>
                        <Dropdown options={buildSortOptions()} value={sort} onChange={changeSort} style="transparent" />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{t("Sorting.order")}:</label>
                        <Dropdown options={buildDirectionOptions()} value={ascending} onChange={changeDirection} style="transparent" />
                    </div>
                </div>
                {/* <div className="bd-addon-views">
                    {makeControlButton(t("Addons.listView"), <ListIcon />, listView, view === "list")}
                    {makeControlButton(t("Addons.gridView"), <GridIcon />, gridView, view === "grid")}
                </div> */}
            </div>
        </div>,
        (!loading && error) && (
            <div className="bd-addon-store-warning">
                <InfoIcon size="24px" />
                <div>
                    <div>{t("Addons.failedToFetch")}</div>
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