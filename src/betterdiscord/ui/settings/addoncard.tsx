import Logger from "@common/logger";

import Toasts from "@stores/toasts";

import SimpleMarkdown from "@structs/markdown";

import React, {type MouseEvent, type ReactNode} from "react";
import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";

import DropdownInput from "@ui/settings/components/dropdown";
import TextInput from "@ui/settings/components/textbox";

import Switch from "./components/switch";

import Modals from "@ui/modals";

import {CircleDollarSignIcon, CircleHelpIcon, PlugIcon, GithubIcon, GlobeIcon, HeartHandshakeIcon, PaletteIcon, PencilIcon, SettingsIcon, ShieldAlertIcon, Trash2Icon} from "lucide-react";
import {getByKeys} from "@webpack";
import type {default as AddonManager} from "@modules/addonmanager";
import type {Addon, AddonType} from "@typed/addon";
import Thememanager, {
    Manager,
    type Theme,
    type ThemePropertyState,
import type {MouseEvent, ReactNode} from "react";
import type {default as AddonManager, Addon} from "@modules/addonmanager";
import Thememanager, {
    Manager,
    type Theme,
    type ThemePropertyState, type ThemePropertyStateCheckbox,
    type ThemePropertyStateSlider
} from "@modules/thememanager.ts";
import SettingItem from "@ui/settings/components/item";
import ConfirmationModal from "@ui/modals/confirmation.tsx";
import ModalRoot from "@ui/modals/root.tsx";
import Slider from "@ui/settings/components/slider.tsx";
import Number from "@ui/settings/components/number.tsx";
import Color from "@ui/settings/components/color.tsx";
import fs from "fs";
import path from "path";
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
    type: AddonType;
    disabled?: boolean;
    onChange(id: string): void;
    hasSettings: boolean;
    editAddon(): void;
    deleteAddon(): void;
    getSettingsPanel?(): HTMLElement | ReactNode;
    store: AddonManager;
    hasThemeSettings?: boolean;
}

function ThemeSettingsParse({name, data, addon}: {name: string, data: ThemePropertyState, addon: Theme}) {
    const initial = (Manager.getValue(addon.slug, name) ?? data["initial-value"]) as string | boolean;
    const [value, setValue] = React.useState(initial);

    const onChange = (e: string) => {
        let newValue = e;
        if (data.syntax === "<percentage>") {
            newValue += "%";
        }
        else if (data.syntax === "<length>") {
            newValue += "px";
        }
        else if (data.file) {
            const ext = path.extname(e).slice(1).toLowerCase();
            const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
            const base64 = fs.readFileSync(e, "base64");
            newValue = `url(data:${mime};base64,${base64})`;
        }
        setValue(newValue);
        Thememanager.updateStyleSheet(name, newValue, data);
        Manager.updateFile(addon.slug, name, newValue);
        console.log(newValue, name, data);
    };

    if (data.options) {
        const options = data.options.split("|").map(s => s.trim()).filter(Boolean).map(entry => {
            const eqIndex = entry.indexOf("=");
            if (eqIndex === -1) return {value: entry, label: entry};
            return {value: entry.slice(0, eqIndex).trim(), label: entry.slice(eqIndex + 1).trim()};
        });

        return <DropdownInput onChange={onChange} value={value} options={options}/>;
    }

    switch (data.syntax) {
        case "<color>":
            return <Color onChange={onChange} value={value} />;
        case "<length>":
        {
            const c = data as ThemePropertyStateSlider;
            return <Slider onChange={onChange} type={"range"} max={parseFloat(c.max)} min={parseFloat(c.min)} step={c.step} value={parseFloat(value)} />;
        }
        case "<percentage>":
            return <Number onChange={onChange} value={parseInt(value, 10)} />;
        case "<integer>":
        {
            const c = data as ThemePropertyStateSlider;
            return <Slider onChange={onChange} type={"range"} max={parseFloat(c.max)} min={parseFloat(c.min)} step={c.step ?? "1"} value={parseInt(value, 10)} />;
        }
        case "<number>":
            return <Number onChange={onChange} value={parseFloat(value)} />;
        case "<boolean>":
            return <Switch onChange={onChange} value={value}/>;
        case "<custom-ident>":
        case "<url>":
        case "*":
        {
            // if (kekbox.file) return <Filepicker multiple={false} accept={"image/*"} onChange={onChange}/>;
            return <TextInput onChange={onChange} value={value} />;
        }
        default:
            return null;
    }
}
export default function AddonCard({addon, enabled, type, disabled, onChange: parentChange, hasSettings, editAddon, deleteAddon, getSettingsPanel, hasThemeSettings}: AddonCardProps) {
    const onChange = useCallback(() => {
        if (parentChange) parentChange(addon.id);
    }, [addon.id, parentChange]);

    const showSettings = useCallback(() => {
        const name = getString(addon.name);
        try {
            if (hasThemeSettings && type === "theme") {
                Modals.openModal((props) => {
                    const properties = (addon as Theme).properties;

                    return <ConfirmationModal size={ModalRoot.Sizes.MEDIUM} {...props} className="bd-settings">
                        {Object.entries(properties).map(([key, value]) => {
                            const parsed = SimpleMarkdown.parseToReact(value.note);

                            return <SettingItem id={key} note={parsed} name={value.name} inline={true}>
                                    <ThemeSettingsParse name={key} data={value} addon={addon} />
                                </SettingItem>;
                        })}
                    </ConfirmationModal>;
                });
            }
            if (hasSettings && type === "plugin") {
                Modals.showAddonSettingsModal(name, getSettingsPanel!());
            }
            return;
        }
        catch (err) {
            Toasts.show(t("Addons.settingsError", {name}), {type: "error"});
            Logger.stacktrace("Addon Settings", "Unable to get settings panel for " + name + ".", err as Error);
        }
    }, [hasSettings, hasThemeSettings, addon, type, getSettingsPanel]);

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
                {(hasSettings || hasThemeSettings) && makeButton(t("Addons.addonSettings"), <SettingsIcon size={"20px"} />, showSettings, {isControl: true, disabled: !enabled})}
                {editAddon && makeButton(t("Addons.editAddon"), <PencilIcon size={"20px"} />, editAddon, {isControl: true})}
                {deleteAddon && makeButton(t("Addons.deleteAddon"), <Trash2Icon size={"20px"} />, deleteAddon, {isControl: true, danger: true})}
            </div>
        </div>;
    }, [hasSettings, hasThemeSettings, showSettings, enabled, editAddon, deleteAddon, addon]);

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
