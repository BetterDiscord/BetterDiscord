import React, {useState, useCallback, useMemo} from "@modules/react";
import {t} from "@common/i18n";
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
import {useStateFromStores} from "@ui/hooks";
import {type Addon} from "@modules/addonmanager";
import type AddonManager from "@modules/addonmanager"; // eslint-disable-line no-duplicate-imports
import type {Plugin} from "@modules/pluginmanager";
import type {ChangeEvent, MouseEvent, ReactNode} from "react";



type ViewTypes = "grid" | "list";
type SortTypes = "name" | "author" | "version" | "added" | "modified" | "isEnabled";

const buildSortOptions = () => ([
    {label: t("Addons.name"), value: "name"},
    {label: t("Addons.author"), value: "author"},
    {label: t("Addons.version"), value: "version"},
    {label: t("Addons.added"), value: "added"},
    {label: t("Addons.modified"), value: "modified"},
    {label: t("Addons.isEnabled"), value: "isEnabled"}
] as Array<{label: string; value: SortTypes;}>);


function openFolder(folder: string) {
    ipc.openPath(folder);
}

function Blankslate({type, folder}: {type: "plugin" | "theme"; folder: string;}) {
    // TODO: doggy update context type as needed
    const {toggleStore} = React.useContext(addonContext) as {title: string; toggleStore(): void;};
    const storeEnabled = Settings.get("settings", "store", "bdAddonStore");
    const message = t("Addons.blankSlateMessage", {link: Web.pages[`${type}s`], context: type}).toString();
    const onClick = storeEnabled ? toggleStore : () => openFolder(folder);
    const buttonKey = storeEnabled ? "Addons.openStore" : "Addons.openFolder";
    return <EmptySlate title={t("Addons.blankSlateHeader", {context: type})} message={storeEnabled ? "" : message}>
        <Button size={Button.Sizes.LARGE} onClick={onClick}>
            {t(buttonKey, {context: type})}
        </Button>
    </EmptySlate>;
}

function makeControlButton(title: string, children: ReactNode, action: () => void, selected = false) {
    return <DiscordModules.Tooltip color="primary" position="top" text={title.toString()}>
        {(props) => {
            return <Button {...props} size={Button.Sizes.NONE} aria-label={title.toString()} look={Button.Looks.BLANK} className={"bd-button bd-view-button" + (selected ? " selected" : "")} onClick={action}>{children}</Button>;
        }}
    </DiscordModules.Tooltip>;
}

function confirmDelete(addon: Addon) {
    return new Promise(resolve => {
        Modals.showConfirmationModal(t("Modals.confirmAction"), t("Addons.confirmDelete", {name: addon.name}), {
            danger: true,
            confirmText: t("Addons.deleteAddon"),
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
function confirmEnable(action: () => void, type: string) {
    /**
     * @param {MouseEvent} event
     */
    return function (event: MouseEvent) {
        if (event.shiftKey) return action();
        Modals.showConfirmationModal(t("Modals.confirmAction"), t("Addons.enableAllWarning", {context: type.toLocaleLowerCase()}), {
            confirmText: t("Modals.okay"),
            cancelText: t("Modals.cancel"),
            danger: true,
            onConfirm: action,
        });
    };
}

function StoreCard() {
    // TODO: doggy update context type as needed
    const {toggleStore, store} = React.useContext(addonContext) as {toggleStore(): void; store: AddonManager;};

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
                <Text color={Text.Colors.HEADER_PRIMARY} className="bd-store-card-title">{t("Addons.openStore", {context: store.prefix})}</Text>
                <Text color={Text.Colors.HEADER_SECONDARY} className="bd-store-card-description">{t("Addons.storeMessage", {context: store.prefix})}</Text>
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
export default function AddonList({store}: {store: AddonManager;}) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<ReturnType<typeof buildSortOptions>[number]["value"]>(getState.bind(null, store.prefix, "sort", "name"));
    const [ascending, setAscending] = useState(getState.bind(null, store.prefix, "ascending", true));
    const [view, setView] = useState<ViewTypes>(getState.bind(null, store.prefix, "view", "list"));


    const addonList = useStateFromStores(store, () => store.addonList.concat(), [store], true);
    const addonState = useStateFromStores(store, () => Object.assign({}, store.state), [store], true);

    const onChange = useCallback((id: string) => {
        store.toggleAddon(id);
    }, [store]);

    const enableAll = useCallback(() => {
        store.enableAllAddons();
    }, [store]);

    const disableAll = useCallback(() => {
        store.disableAllAddons();
    }, [store]);

    const changeView = useCallback((value: ViewTypes) => {
        saveState(store.prefix, "view", value);
        setView(value);
    }, [store.prefix]);

    const listView = useCallback(() => changeView("list"), [changeView]);
    const gridView = useCallback(() => changeView("grid"), [changeView]);

    const changeDirection = useCallback((value: boolean) => {
        saveState(store.prefix, "ascending", value);
        setAscending(value);
    }, [store.prefix]);

    const changeSort = useCallback((value: SortTypes) => {
        saveState(store.prefix, "sort", value);
        setSort(value);
    }, [store.prefix]);

    const search = useCallback((e: ChangeEvent<HTMLInputElement>) => setQuery(e.currentTarget.value.toLocaleLowerCase()), []);
    const triggerEdit = useCallback((id: string) => store.editAddon?.(id), [store]);
    const triggerDelete = useCallback(async (id: string) => {
        const addon = addonList.find(a => a.id == id)!;
        const shouldDelete = await confirmDelete(addon);
        if (!shouldDelete) return;
        store?.deleteAddon?.(addon);
    }, [addonList, store]);

    const renderedCards = useMemo(() => {
        let sorted = addonList.sort((a, b) => {
            const sortByEnabled = sort === "isEnabled";
            const first = sortByEnabled ? addonState[a.id] : a[sort];
            const second = sortByEnabled ? addonState[b.id] : b[sort];
            const stringSort = (str1: string, str2: string) => str1.toLocaleLowerCase().localeCompare(str2.toLocaleLowerCase());
            if (typeof (first) === "string" && typeof (second) === "string") return stringSort(first, second);
            if (typeof (first) === "boolean" && typeof (second) === "boolean") return (first === second) ? stringSort(a.name, b.name) : first ? -1 : 1;
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
            const hasSettings = (addon as Plugin).instance && typeof ((addon as Plugin).instance.getSettingsPanel) === "function";
            const getSettings = hasSettings && (addon as Plugin).instance.getSettingsPanel!.bind((addon as Plugin).instance);
            return <ErrorBoundary id={addon.id} name="AddonCard">
                <AddonCard store={store} disabled={addon.partial} type={store.prefix as "plugin" | "theme"} editAddon={() => triggerEdit(addon.id)} deleteAddon={() => triggerDelete(addon.id)} key={addon.id} addon={addon} onChange={onChange} enabled={addonState[addon.id]} hasSettings={hasSettings} getSettingsPanel={getSettings ? getSettings : undefined} />
            </ErrorBoundary>;
        });
    }, [store, addonList, addonState, onChange, triggerDelete, triggerEdit, query, ascending, sort]);

    const hasAddonsInstalled = addonList.length !== 0;
    const isSearching = !!query;
    const hasResults = renderedCards.length !== 0;

    return [
        <AddonHeader count={renderedCards.length} searching={isSearching}>
            <Search onChange={search} placeholder={`${t("Addons.search", {count: renderedCards.length, context: store.prefix})}...`} />
        </AddonHeader>,
        <div className={"bd-controls bd-addon-controls"}>
            <div className="bd-controls-basic">
                {makeBasicButton(t("Addons.openFolder", {context: store.prefix}), <FolderIcon size="20px" />, openFolder.bind(null, store.addonFolder), "folder")}
                {makeBasicButton(t("Addons.enableAll"), <CheckIcon size="20px" />, confirmEnable(enableAll, store.prefix), "enable-all")}
                {makeBasicButton(t("Addons.disableAll"), <XIcon size="20px" />, disableAll, "disable-all")}
            </div>
            <div className="bd-controls-advanced">
                <div className="bd-addon-dropdowns">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{t("Sorting.sortBy")}:</label>
                        <Dropdown options={buildSortOptions()} value={sort} onChange={changeSort} style="transparent" />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">{t("Sorting.order")}:</label>
                        <Dropdown options={buildDirectionOptions()} value={ascending} onChange={changeDirection} style="transparent" />
                    </div>
                </div>
                <div className="bd-addon-views">
                    {makeControlButton(t("Addons.listView"), <StretchHorizontalIcon size="20px" />, listView, view === "list")}
                    {makeControlButton(t("Addons.gridView"), <LayoutGridIcon />, gridView, view === "grid")}
                </div>
            </div>
        </div>,
        <StoreCard />,
        !hasAddonsInstalled && <Blankslate type={store.prefix as "plugin" | "theme"} folder={store.addonFolder} />,
        isSearching && !hasResults && hasAddonsInstalled && <NoResults />,
        hasAddonsInstalled && <div key="addonList" className={"bd-addon-list" + (view == "grid" ? " bd-grid-view" : "")}>{renderedCards}</div>
    ];
}
