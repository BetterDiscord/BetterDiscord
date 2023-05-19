import Logger from "@common/logger";

import SimpleMarkdown from "@structs/markdown";

import React from "@modules/react";
import Strings from "@modules/strings";
import WebpackModules from "@modules/webpackmodules";
import DiscordModules from "@modules/discordmodules";


import Switch from "./components/switch";

import Modals from "@ui/modals";
import Toasts from "@ui/toasts";

import EditIcon from "@ui/icons/edit";
import DeleteIcon from "@ui/icons/delete";
import CogIcon from "@ui/icons/cog";
import GitHubIcon from "@ui/icons/github";
import MoneyIcon from "@ui/icons/dollarsign";
import WebIcon from "@ui/icons/globe";
import PatreonIcon from "@ui/icons/patreon";
import SupportIcon from "@ui/icons/support";
import ExtIcon from "@ui/icons/extension";
import ErrorIcon from "@ui/icons/error";
import ThemeIcon from "@ui/icons/theme";

const {useState, useCallback, useMemo} = React;


const LinkIcons = {
    website: WebIcon,
    source: GitHubIcon,
    invite: SupportIcon,
    donate: MoneyIcon,
    patreon: PatreonIcon
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

const UserStore = WebpackModules.getByProps("getCurrentUser");
const ChannelStore = WebpackModules.getByProps("getDMFromUserId");
const PrivateChannelActions = WebpackModules.getByProps("openPrivateChannel");
const ChannelActions = WebpackModules.getByProps("selectPrivateChannel");
const getString = value => typeof value == "string" ? value : value.toString();

function makeButton(title, children, action, {isControl = false, danger = false, disabled = false} = {}) {
    const ButtonType = isControl ? "button" : "div";
    return <DiscordModules.Tooltip color="primary" position="top" text={title}>
                {(props) => {
                    return <ButtonType {...props} className={(isControl ? "bd-button bd-addon-button" : "bd-addon-button") + (danger ? " bd-button-danger" : "") + (disabled ? " bd-button-disabled" : "")} onClick={action}>{children}</ButtonType>;
                }}
            </DiscordModules.Tooltip>;
}

function buildLink(type, url) {
    if (!url) return null;
    const icon = React.createElement(LinkIcons[type]);
    const link = <a className="bd-link bd-link-website" href={url} target="_blank" rel="noopener noreferrer">{icon}</a>;
    if (type == "invite") {
        link.props.onClick = function(event) {
            event.preventDefault();
            event.stopPropagation();
            let code = url;
            const tester = /\.gg\/(.*)$/;
            if (tester.test(code)) code = code.match(tester)[1];
            LayerManager.popLayer();
            DiscordModules.InviteActions?.acceptInviteAndTransitionToInviteChannel({inviteKey: code});
        };
    }
    return makeButton(Strings.Addons[type], link);
}

export default function AddonCard({addon, type, disabled, enabled: initialValue, onChange: parentChange, hasSettings, editAddon, deleteAddon, getSettingsPanel}) {
    const [isEnabled, setEnabled] = useState(initialValue);
    const onChange = useCallback(() => {
        setEnabled(!isEnabled);
        if (parentChange) parentChange(addon.id);
    }, [addon.id, parentChange, isEnabled]);

    const showSettings = useCallback(() => {
        if (!hasSettings || !isEnabled) return;
        const name = getString(addon.name);
        try {
            Modals.showAddonSettingsModal(name, getSettingsPanel());
        }
        catch (err) {
            Toasts.show(Strings.Addons.settingsError.format({name}), {type: "error"});
            Logger.stacktrace("Addon Settings", "Unable to get settings panel for " + name + ".", err);
        }
    }, [hasSettings, isEnabled, addon.name, getSettingsPanel]);

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
            <div className="bd-name">{getString(addon.name)}</div>,
            <div className="bd-meta">
                <span className="bd-version">v{getString(addon.version)}</span>
                {authorArray}
            </div>
        ];
    }, [addon.name, addon.version, addon.authorLink, addon.authorId, addon.author, messageAuthor]);

    const footer = useMemo(() => {
        const links = Object.keys(LinkIcons);
        const linkComponents = links.map(l => buildLink(l, addon[l])).filter(c => c);
        return <div className="bd-footer">
                    <span className="bd-links">{linkComponents}</span> 
                    <div className="bd-controls">
                        {hasSettings && makeButton(Strings.Addons.addonSettings, <CogIcon size={"20px"} />, showSettings, {isControl: true, disabled: !isEnabled})}
                        {editAddon && makeButton(Strings.Addons.editAddon, <EditIcon size={"20px"} />, editAddon, {isControl: true})}
                        {deleteAddon && makeButton(Strings.Addons.deleteAddon, <DeleteIcon size={"20px"} />, deleteAddon, {isControl: true, danger: true})}
                    </div>
                </div>;
    }, [hasSettings, editAddon, deleteAddon, addon, isEnabled, showSettings]);

    return <div id={`${addon.id}-card`} className={"bd-addon-card" + (disabled ? " bd-addon-card-disabled" : "")}>
                <div className="bd-addon-header">
                        {type === "plugin" ? <ExtIcon size="18px" className="bd-icon" /> : <ThemeIcon size="18px" className="bd-icon" />}
                        <div className="bd-title">{title}</div>
                        <Switch disabled={disabled} checked={isEnabled} onChange={onChange} />
                </div>
                <div className="bd-description-wrap">
                    {disabled && <div className="banner banner-danger"><ErrorIcon className="bd-icon" />{`An error was encountered while trying to load this ${type}.`}</div>}
                    <div className="bd-description">{SimpleMarkdown.parseToReact(getString(addon.description))}</div>
                </div>
                {footer}
            </div>;
}
