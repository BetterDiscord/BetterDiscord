import React, {useState, useCallback, useMemo} from "@modules/react";
import Strings from "@modules/strings";
import DiscordModules from "@modules/discordmodules";
import ipc from "@modules/ipc";

import Button from "../base/button";
import AddonCard from "./addoncard";
import Dropdown from "./components/dropdown";
import Search from "./components/search";

import Modals from "@ui/modals";
import ErrorBoundary from "@ui/errorboundary";

import NoResults from "@ui/blankslates/noresults";
import EmptySlate from "@ui/blankslates/empty";
import Web from "@data/web";
import {buildDirectionOptions, makeBasicButton, getState, saveState, AddonHeader, addonContext} from "./addonshared";
import Settings from "@stores/settings";
import Text from "@ui/base/text";
import {CheckIcon, ChevronRightIcon, FolderIcon, LayoutGridIcon, StoreIcon, StretchHorizontalIcon, XIcon} from "lucide-react";
import {useInternalStore} from "@ui/hooks";
import {shallowEqual} from "fast-equals";


const buildSortOptions = () => [
    {label: Strings.Addons.name, value: "name"},
    {label: Strings.Addons.author, value: "author"},
    {label: Strings.Addons.version, value: "version"},
    {label: Strings.Addons.added, value: "added"},
    {label: Strings.Addons.modified, value: "modified"},
    {label: Strings.Addons.isEnabled, value: "isEnabled"}
];


function openFolder(folder) {
    ipc.openPath(folder);
}

function Blankslate({type, folder}) {
    const {toggleStore} = React.useContext(addonContext);
    const storeEnabled = Settings.get("settings", "store", "bdAddonStore");
    const message = Strings.Addons.blankSlateMessage.format({link: Web.pages[`${type}s`], type}).toString();
    const onClick = storeEnabled ? toggleStore : () => openFolder(folder);
    const buttonLabel = storeEnabled ? Strings.Addons.openStore : Strings.Addons.openFolder;
    return <EmptySlate title={Strings.Addons.blankSlateHeader.format({type})} message={storeEnabled ? "" : message}>
        <Button size={Button.Sizes.LARGE} onClick={onClick}>
            {buttonLabel.format({type: `${type[0].toUpperCase()}${type.substring(1)}`})}
        </Button>
    </EmptySlate>;
}

function makeControlButton(title, children, action, selected = false) {
    return <DiscordModules.Tooltip color="primary" position="top" text={title.toString()}>
        {(props) => {
            return <Button {...props} size={Button.Sizes.NONE} aria-label={title.toString()} look={Button.Looks.BLANK} className={"bd-button bd-view-button" + (selected ? " selected" : "")} onClick={action}>{children}</Button>;
        }}
    </DiscordModules.Tooltip>;
}

function confirmDelete(addon) {
    return new Promise(resolve => {
        Modals.showConfirmationModal(Strings.Modals.confirmAction, Strings.Addons.confirmDelete.format({name: addon.name}), {
            danger: true,
            confirmText: Strings.Addons.deleteAddon,
            onConfirm: () => {resolve(true);},
            onCancel: () => {resolve(false);}
        });
    });
}

/**
 * @param {function} action
 * @param {string} type
 * @returns
 */
function confirmEnable(action, type) {
    /**
     * @param {MouseEvent} event
     */
    return function (event) {
        if (event.shiftKey) return action();
        Modals.showConfirmationModal(Strings.Modals.confirmAction, Strings.Addons.enableAllWarning.format({type: type.toLocaleLowerCase()}), {
            confirmText: Strings.Modals.okay,
            cancelText: Strings.Modals.cancel,
            danger: true,
            onConfirm: action,
        });
    };
}

function StoreCard() {
    const {title, toggleStore} = React.useContext(addonContext);

    if (!Settings.get("settings", "store", "bdAddonStore")) return;

    return (
        <div
            className="bd-store-card"
            onClick={toggleStore}
        >
            <div className="bd-store-card-icon">
                <StoreIcon size="24px" />
            </div>
            <div className="bd-store-card-body">
                <Text color={Text.Colors.HEADER_PRIMARY} className="bd-store-card-title">{Strings.Addons.openStore.format({type: title})}</Text>
                <Text color={Text.Colors.HEADER_SECONDARY} className="bd-store-card-description">{Strings.Addons.storeMessage.format({type: title.toLocaleLowerCase()})}</Text>
            </div>
            <div className="bd-store-card-caret">
                <ChevronRightIcon size="24px" />
            </div>
        </div>
    );
}

/**
 * @param {object} props
 * @param {import("@modules/addonmanager").default} props.store
 * @returns
 */
export default function AddonList({title, store}) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState(getState.bind(null, store.prefix, "sort", "name"));
    const [ascending, setAscending] = useState(getState.bind(null, store.prefix, "ascending", true));
    const [view, setView] = useState(getState.bind(null, store.prefix, "view", "list"));


    const addonList = useInternalStore(store, () => store.addonList, [store]);
    const addonState = useInternalStore(store, () => Object.assign({}, store.state), [store], shallowEqual);

    const onChange = useCallback((id) => {
        store.toggleAddon(id);
    }, [store]);

    const reload = useCallback((id) => {
        store.reloadAddon(id);
    }, [store]);

    const enableAll = useCallback(() => {
        store.enableAllAddons();
    }, [store]);

    const disableAll = useCallback(() => {
        store.disableAllAddons();
    }, [store]);

    const changeView = useCallback((value) => {
        saveState(store.prefix, "view", value);
        setView(value);
    }, [store.prefix]);

    const listView = useCallback(() => changeView("list"), [changeView]);
    const gridView = useCallback(() => changeView("grid"), [changeView]);

    const changeDirection = useCallback((value) => {
        saveState(store.prefix, "ascending", value);
        setAscending(value);
    }, [store.prefix]);

    const changeSort = useCallback((value) => {
        saveState(store.prefix, "sort", value);
        setSort(value);
    }, [store.prefix]);

    const search = useCallback((e) => setQuery(e.target.value.toLocaleLowerCase()), []);
    const triggerEdit = useCallback((id) => store.editAddon?.(id), [store]);
    const triggerDelete = useCallback(async (id) => {
        const addon = addonList.find(a => a.id == id);
        const shouldDelete = await confirmDelete(addon);
        if (!shouldDelete) return;
        store?.deleteAddon?.(addon);
    }, [addonList, store]);

    const renderedCards = useMemo(() => {
        let sorted = addonList.sort((a, b) => {
            const sortByEnabled = sort === "isEnabled";
            const first = sortByEnabled ? addonState[a.id] : a[sort];
            const second = sortByEnabled ? addonState[b.id] : b[sort];
            const stringSort = (str1, str2) => str1.toLocaleLowerCase().localeCompare(str2.toLocaleLowerCase());
            if (typeof (first) == "string") return stringSort(first, second);
            if (typeof (first) == "boolean") return (first === second) ? stringSort(a.name, b.name) : first ? -1 : 1;
            if (first > second) return 1;
            if (second > first) return -1;
            return 0;
        });

        if (!ascending) sorted.reverse();

        if (query) {
            sorted = sorted.filter(addon => {
                let matches = addon.name.toLocaleLowerCase().includes(query);
                matches = matches || addon.author.toLocaleLowerCase().includes(query);
                matches = matches || addon.description.toLocaleLowerCase().includes(query);
                if (!matches) return false;
                return true;
            });
        }

        return sorted.map(addon => {
            const hasSettings = addon.instance && typeof (addon.instance.getSettingsPanel) === "function";
            const getSettings = hasSettings && addon.instance.getSettingsPanel.bind(addon.instance);
            return <ErrorBoundary id={addon.id} name="AddonCard">
                <AddonCard store={store} disabled={addon.partial} type={store.prefix} editAddon={() => triggerEdit(addon.id)} deleteAddon={() => triggerDelete(addon.id)} key={addon.id} addon={addon} onChange={onChange} enabled={addonState[addon.id]} reload={reload} hasSettings={hasSettings} getSettingsPanel={getSettings} />
            </ErrorBoundary>;
        });
    }, [store, addonList, addonState, onChange, reload, triggerDelete, triggerEdit, query, ascending, sort]);

    const hasAddonsInstalled = addonList.length !== 0;
    const isSearching = !!query;
    const hasResults = renderedCards.length !== 0;

    return [
        <AddonHeader count={renderedCards.length} searching={isSearching}>
            <Search onChange={search} placeholder={`${Strings.Addons.search.format({type: `${renderedCards.length} ${title}`})}...`} />
        </AddonHeader>,
        <div className={"bd-controls bd-addon-controls"}>
            {/* <Search onChange={search} placeholder={`${Strings.Addons.search.format({type: title})}...`} /> */}
            <div className="bd-controls-basic">
                {makeBasicButton(Strings.Addons.openFolder.format({type: title}), <FolderIcon size="20px" />, openFolder.bind(null, store.addonFolder), "folder")}
                {makeBasicButton(Strings.Addons.enableAll, <CheckIcon size="20px" />, confirmEnable(enableAll, title), "enable-all")}
                {makeBasicButton(Strings.Addons.disableAll, <XIcon size="20px" />, disableAll, "disable-all")}
            </div>
            <div className="bd-controls-advanced">
                <div className="bd-addon-dropdowns">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.sortBy}:</label>
                        <Dropdown options={buildSortOptions()} value={sort} onChange={changeSort} style="transparent" />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{Strings.Sorting.order}:</label>
                        <Dropdown options={buildDirectionOptions()} value={ascending} onChange={changeDirection} style="transparent" />
                    </div>
                </div>
                <div className="bd-addon-views">
                    {makeControlButton(Strings.Addons.listView, <StretchHorizontalIcon size="20px" />, listView, view === "list")}
                    {makeControlButton(Strings.Addons.gridView, <LayoutGridIcon />, gridView, view === "grid")}
                </div>
            </div>
        </div>,
        <StoreCard />,
        !hasAddonsInstalled && <Blankslate type={store.prefix} folder={store.addonFolder} />,
        isSearching && !hasResults && hasAddonsInstalled && <NoResults />,
        hasAddonsInstalled && <div key="addonList" className={"bd-addon-list" + (view == "grid" ? " bd-grid-view" : "")}>{renderedCards}</div>
    ];
}
