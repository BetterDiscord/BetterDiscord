import Logger from "@common/logger";

import Toasts from "@stores/toasts";

import SimpleMarkdown from "@structs/markdown";

import React from "@modules/react";
import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";

import Switch from "./components/switch";

import Modals from "@ui/modals";

import {CircleDollarSignIcon, CircleHelpIcon, PlugIcon, GithubIcon, GlobeIcon, HeartHandshakeIcon, PaletteIcon, PencilIcon, SettingsIcon, ShieldAlertIcon, Trash2Icon} from "lucide-react";
import {getByKeys} from "@webpack";
import type {MouseEvent, ReactNode} from "react";
import type {default as AddonManager, Addon} from "@modules/addonmanager";

const {useCallback, useMemo} = React;


const LinkIcons = {
    website: GlobeIcon,
    source: GithubIcon,
    invite: CircleHelpIcon,
    donate: CircleDollarSignIcon,
    patreon: HeartHandshakeIcon
} as const;

const LayerManager = {
    pushLayer(component: React.FC) {
        DiscordModules.Dispatcher.dispatch({
            type: "LAYER_PUSH",
            component
        });
    },
    popLayer() {
        DiscordModules.Dispatcher.dispatch({
            type: "LAYER_POP"
        });
    },
    popAllLayers() {
        DiscordModules.Dispatcher.dispatch({
            type: "LAYER_POP_ALL"
        });
    }
};

const UserStore = getByKeys<{getCurrentUser(): {id: string;};}>(["getCurrentUser"], {firstId: 287809, cacheId: "core-addoncard-UserStore"});
const ChannelStore = getByKeys<{getDMFromUserId(id: string): string;}>(["getDMFromUserId"], {firstId: 734057, cacheId: "core-addoncard-ChannelStore"});
const PrivateChannelActions = getByKeys<{openPrivateChannel(me: string, them: string): void;}>(["openPrivateChannel"], {
    firstId: 308528,
    cacheId: "core-addoncard-PrivateChannelActions"
});
const ChannelActions = getByKeys<{selectPrivateChannel(id: string): void;}>(["selectPrivateChannel"], {
    searchExports: true,
    firstId: 956793,
    cacheId: "core-addoncard-ChannelActions"
});
const getString = (value: string | {toString(): string;}) => typeof value == "string" ? value : value?.toString?.() || "";

function makeButton(title: string, children: ReactNode, action?: () => void, {isControl = false, danger = false, disabled = false} = {}) {
    const ButtonType = isControl ? "button" : "div";
    return <DiscordModules.Tooltip color="primary" position="top" text={title}>
        {(props) => {
            return <ButtonType {...props} aria-label={title.toString()} className={(isControl ? "bd-button bd-button-filled bd-addon-button" : "bd-addon-button") + (danger ? " bd-button-color-red" : isControl ? " bd-button-color-brand" : "") + (disabled ? " bd-button-disabled" : "")} onClick={action} disabled={disabled}>{children}</ButtonType>;
        }}
    </DiscordModules.Tooltip>;
}

function buildLink(type: keyof typeof LinkIcons, url?: string) {
    if (!url) return null;
    const icon = React.createElement(LinkIcons[type], {size: "20px"});
    const link = <a className="bd-link bd-link-website" href={url} target="_blank" rel="noopener noreferrer">{icon}</a>;
    if (type == "invite") {
        link.props.onClick = function (event: MouseEvent) {
            event.preventDefault();
            event.stopPropagation();

            Modals.showGuildJoinModal(url);
        };
    }
    return makeButton(t(`Addons.${type}`), link);
}

export interface AddonCardProps {
    addon: Addon;
    enabled: boolean;
    type: "plugin" | "theme";
    disabled?: boolean;
    onChange(id: string): void;
    hasSettings: boolean;
    editAddon(): void;
    deleteAddon(): void;
    getSettingsPanel?(): HTMLElement | ReactNode;
    store: AddonManager;
}

export default function AddonCard({addon, enabled, type, disabled, onChange: parentChange, hasSettings, editAddon, deleteAddon, getSettingsPanel}: AddonCardProps) {

    const onChange = useCallback(() => {
        if (parentChange) parentChange(addon.id);
    }, [addon.id, parentChange]);

    const showSettings = useCallback(() => {
        if (!hasSettings || !enabled) return;
        const name = getString(addon.name);
        try {
            Modals.showAddonSettingsModal(name, getSettingsPanel!());
        }
        catch (err) {
            Toasts.show(t("Addons.settingsError", {name}), {type: "error"});
            Logger.stacktrace("Addon Settings", "Unable to get settings panel for " + name + ".", err as Error);
        }
    }, [hasSettings, enabled, addon.name, getSettingsPanel]);

    const messageAuthor = useCallback(() => {
        if (!addon.authorId) return;
        if (LayerManager) LayerManager.popLayer();
        if (!UserStore || !ChannelActions || !ChannelStore || !PrivateChannelActions) return;
        const selfId = UserStore.getCurrentUser().id;
        if (selfId == addon.authorId) return;
        const privateChannelId = ChannelStore.getDMFromUserId(addon.authorId);
        if (privateChannelId) return ChannelActions.selectPrivateChannel(privateChannelId);
        PrivateChannelActions.openPrivateChannel(selfId, addon.authorId);
    }, [addon.authorId]);


    const title = useMemo(() => {
        const authorArray: Array<string | React.JSX.Element> = t("Addons.byline").split(/({{[A-Za-z]+}})/);
        const authorComponent = addon.authorLink || addon.authorId
            ? <a className="bd-link bd-link-website" href={addon.authorLink || ""} onClick={messageAuthor} target="_blank" rel="noopener noreferrer">{getString(addon.author)}</a>
            : <span className="bd-author">{getString(addon.author)}</span>;

        const authorIndex = authorArray.findIndex(s => s == "{{author}}");
        if (authorIndex) authorArray[authorIndex] = authorComponent;

        return [
            <div className="bd-name">
                {/* {AddonStore.isOfficial(addon.filename) && <FlowerStar />} */}
                {getString(addon.name)}
            </div>,
            <div className="bd-meta">
                <span className="bd-version">v{getString(addon.version)}</span>
                {authorArray}
            </div>
        ];
    }, [addon.name, addon.version, addon.authorLink, addon.authorId, addon.author, messageAuthor]);

    const footer = useMemo(() => {
        const links = Object.keys(LinkIcons) as Array<keyof typeof LinkIcons>;
        const linkComponents = links.map(l => buildLink(l, addon[l])).filter(c => c);
        return <div className="bd-footer">
            <span className="bd-links">{linkComponents}</span>
            <div className="bd-controls">
                {hasSettings && makeButton(t("Addons.addonSettings"), <SettingsIcon size={"20px"} />, showSettings, {isControl: true, disabled: !enabled})}
                {editAddon && makeButton(t("Addons.editAddon"), <PencilIcon size={"20px"} />, editAddon, {isControl: true})}
                {deleteAddon && makeButton(t("Addons.deleteAddon"), <Trash2Icon size={"20px"} />, deleteAddon, {isControl: true, danger: true})}
            </div>
        </div>;
    }, [hasSettings, editAddon, deleteAddon, addon, enabled, showSettings]);

    return <div id={`${addon.id}-card`} className={"bd-addon-card" + (disabled ? " bd-addon-card-disabled" : "")}>
        <div className="bd-addon-header">
            {type === "plugin" ? <PlugIcon size="20px" className="bd-icon" /> : <PaletteIcon size="20px" className="bd-icon" />}
            <div className="bd-title">{title}</div>
            <Switch internalState={false} disabled={disabled} value={enabled} onChange={onChange} />
        </div>
        <div className="bd-description-wrap">
            {disabled && <div className="banner banner-danger"><ShieldAlertIcon className="bd-icon" />{`An error was encountered while trying to load this ${type}.`}</div>}
            <div className="bd-description">{SimpleMarkdown.parseToReact(getString(addon.description))}</div>
        </div>
        {footer}
    </div>;
}
