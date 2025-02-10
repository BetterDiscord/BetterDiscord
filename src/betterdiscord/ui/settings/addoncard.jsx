import Logger from "@common/logger";

import SimpleMarkdown from "@structs/markdown";

import React from "@modules/react";
import Strings from "@modules/strings";
import DiscordModules from "@modules/discordmodules";


import Switch from "./components/switch";

import Modals from "@ui/modals";
import Toasts from "@ui/toasts";

import {FlowerStar} from "./addonshared";
import AddonStore from "@modules/addonstore";
import {CircleDollarSignIcon, CircleHelpIcon, PlugIcon, GithubIcon, GlobeIcon, HeartHandshakeIcon, PaletteIcon, PencilIcon, SettingsIcon, ShieldAlertIcon, Trash2Icon} from "lucide-react";
import {getByKeys} from "@webpack";

const {useCallback, useMemo} = React;


const LinkIcons = {
    website: GlobeIcon,
    source: GithubIcon,
    invite: CircleHelpIcon,
    donate: CircleDollarSignIcon,
    patreon: HeartHandshakeIcon
};

const LayerManager = {
    pushLayer(component) {
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

const UserStore = getByKeys(["getCurrentUser"]);
const ChannelStore = getByKeys(["getDMFromUserId"]);
const PrivateChannelActions = getByKeys(["openPrivateChannel"]);
const ChannelActions = getByKeys(["selectPrivateChannel"]);
const getString = value => typeof value == "string" ? value : value.toString();

function makeButton(title, children, action, {isControl = false, danger = false, disabled = false} = {}) {
    const ButtonType = isControl ? "button" : "div";
    return <DiscordModules.Tooltip color="primary" position="top" text={title}>
        {(props) => {
            return <ButtonType {...props} aria-label={title.toString()} className={(isControl ? "bd-button bd-button-filled bd-addon-button" : "bd-addon-button") + (danger ? " bd-button-color-red" : isControl ? " bd-button-color-brand" : "") + (disabled ? " bd-button-disabled" : "")} onClick={action} disabled={disabled}>{children}</ButtonType>;
        }}
    </DiscordModules.Tooltip>;
}

function buildLink(type, url) {
    if (!url) return null;
    const icon = React.createElement(LinkIcons[type], {size: "20px"});
    const link = <a className="bd-link bd-link-website" href={url} target="_blank" rel="noopener noreferrer">{icon}</a>;
    if (type == "invite") {
        link.props.onClick = function (event) {
            event.preventDefault();
            event.stopPropagation();

            Modals.showGuildJoinModal(url);
        };
    }
    return makeButton(Strings.Addons[type], link);
}

export default function AddonCard({addon, enabled, type, disabled, onChange: parentChange, hasSettings, editAddon, deleteAddon, getSettingsPanel}) {

    const onChange = useCallback(() => {
        if (parentChange) parentChange(addon.id);
    }, [addon.id, parentChange]);

    const showSettings = useCallback(() => {
        if (!hasSettings || !enabled) return;
        const name = getString(addon.name);
        try {
            Modals.showAddonSettingsModal(name, getSettingsPanel());
        }
        catch (err) {
            Toasts.show(Strings.Addons.settingsError.format({name}), {type: "error"});
            Logger.stacktrace("Addon Settings", "Unable to get settings panel for " + name + ".", err);
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
        const authorArray = Strings.Addons.byline.split(/({{[A-Za-z]+}})/);
        const authorComponent = addon.authorLink || addon.authorId
            ? <a className="bd-link bd-link-website" href={addon.authorLink || null} onClick={messageAuthor} target="_blank" rel="noopener noreferrer">{getString(addon.author)}</a>
            : <span className="bd-author">{getString(addon.author)}</span>;

        const authorIndex = authorArray.findIndex(s => s == "{{author}}");
        if (authorIndex) authorArray[authorIndex] = authorComponent;

        return [
            <div className="bd-name">
                {AddonStore.isOfficial(addon.filename) && <FlowerStar />}
                {getString(addon.name)}
            </div>,
            <div className="bd-meta">
                <span className="bd-version">v{getString(addon.version)}</span>
                {authorArray}
            </div>
        ];
    }, [addon.name, addon.version, addon.authorLink, addon.authorId, addon.author, addon.filename, messageAuthor]);

    const footer = useMemo(() => {
        const links = Object.keys(LinkIcons);
        const linkComponents = links.map(l => buildLink(l, addon[l])).filter(c => c);
        return <div className="bd-footer">
            <span className="bd-links">{linkComponents}</span>
            <div className="bd-controls">
                {hasSettings && makeButton(Strings.Addons.addonSettings, <SettingsIcon size={"20px"} />, showSettings, {isControl: true, disabled: !enabled})}
                {editAddon && makeButton(Strings.Addons.editAddon, <PencilIcon size={"20px"} />, editAddon, {isControl: true})}
                {deleteAddon && makeButton(Strings.Addons.deleteAddon, <Trash2Icon size={"20px"} />, deleteAddon, {isControl: true, danger: true})}
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
