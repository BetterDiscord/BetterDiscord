import path from "path";
import fs from "fs";

import Logger from "@common/logger";

import PluginManager from "@modules/pluginmanager";
import React from "@modules/react";
import Strings from "@modules/strings";
import ThemeManager from "@modules/thememanager";
import DiscordModules from "@modules/discordmodules";
import Events from "@modules/emitter";
import AddonStore from "@modules/addonstore";

import Button from "@ui/base/button";
import Delete from "@ui/icons/delete";
import Download from "@ui/icons/download";
import GitHub from "@ui/icons/github";
import Support from "@ui/icons/support";
import Modals from "@ui/modals";
import request from "request";
import Toasts from "@ui/toasts";
import Utilities from "@modules/utilities";
import Globe from "@ui/icons/globe";
import {TagContext} from "./page";

const {useCallback, useMemo, useState, useEffect, useContext} = React;

/**
 * 
 * @param {import("@modules/addonstore").RawAddon} addon 
 * @returns {string}
 */
const redirect = (addon) => `https://betterdiscord.app/gh-redirect?id=${addon.id}`;

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

function formatNumberWithSuffix(value) {
    if (value === 0) return "0";
  
    const suffixes = ["", "k", "M", "B", "T"]; // Define suffixes for thousands, millions, etc.
    const index = Math.floor(Math.log10(Math.abs(value)) / 3); // Determine the index for the suffix
    const divisor = Math.pow(10, index * 3); // Calculate the divisor (1000, 1,000,000, etc.)
    const formattedValue = (value / divisor).toFixed(0); // Format the number
  
    return `${formattedValue}${suffixes[index]}`; // Concatenate the formatted number with the suffix
  }

/**
 * 
 * @param {{ addon: import("@modules/addonstore").RawAddon }} param0 
 * @returns 
 */
export default function AddonCard({addon, isEmbed}) {
    /** @type {typeof ThemeManager | typeof PluginManager} */
    const manager = useMemo(() => addon.type === "plugin" ? PluginManager : ThemeManager, [addon]);
    const [ isInstalled, setInstalled ] = useState(() => manager.isLoaded(addon.file_name));
    const [ disabled, setDisabled ] = useState(false);

    const [isTagEnabled, toggleTag] = useContext(TagContext);

    const triggerDelete = useCallback(async (event) => {
        const foundAddon = manager.addonList.find(a => a.filename == addon.file_name);

        if (!foundAddon) return;

        if (!event.shiftKey) {
            const shouldDelete = await confirmDelete(foundAddon);
            if (!shouldDelete) return;
        }

        if (manager.deleteAddon) manager.deleteAddon(foundAddon);
    }, [addon, manager]);

    const installAddon = useCallback(() => {
        const foundAddon = manager.addonList.find(a => a.id == addon.id);

        if (foundAddon) return;

        setDisabled(true);

        request(redirect(addon), (error, _, body) => {            
            try {
                if (error) {
                    Logger.stacktrace("AddonStore", `Failed to fetch addon '${addon.file_name}':`, error);
    
                    Toasts.show(Strings.Addons.failedToDownload.format({type: addon.type, name: addon.name}), {
                        type: "danger"
                    });
    
                    return;
                }                
                
                Toasts.show(Strings.Addons.successfullyDownload.format({type: addon.type, name: addon.name}), {
                    type: "success"
                });
    
    
                fs.writeFile(path.join(manager.addonFolder, addon.file_name), body);
            }
            finally {
                setDisabled(false);
            }
        });
    }, [addon, manager]);

    // Maybe show the guild invite confirm modal?
    const acceptInvite = useCallback(() => {
        const guild = addon.guild || addon.author.guild;

        if (!guild) return;

        let code = guild.invite_link;
        const tester = /\.gg\/(.*)$/;
        if (tester.test(code)) code = code.match(tester)[1];
        
        DiscordModules.Dispatcher.dispatch({
            type: "LAYER_POP"
        });

        DiscordModules.InviteActions?.acceptInviteAndTransitionToInviteChannel({inviteKey: code});
    }, [addon]);

    const openSourceCode = useCallback(() => {
        window.open(redirect(addon), "_blank", "noopener,noreferrer");
    }, [addon]);
    
    const openAddonPage = useCallback(() => {
        window.open(`https://betterdiscord.app/${addon.type}?id=${addon.id}`, "_blank", "noopener,noreferrer");
    }, [addon]);

    useEffect(() => {
        setInstalled(() => manager.isLoaded(addon.file_name));

        const listener = () => setInstalled(() => manager.isLoaded(addon.file_name));
        
        Events.on(`${manager.prefix}-loaded`, listener);
        Events.on(`${manager.prefix}-unloaded`, listener);
        
        return () => {
            Events.off(`${manager.prefix}-loaded`, listener);
            Events.off(`${manager.prefix}-unloaded`, listener);
        };
    }, [manager, addon]);

    const badge = useMemo(() => {
        if (AddonStore.isRecentlyUpdated(addon.id)) return Strings.Addons.recentlyUpdated;
        if (AddonStore.isUnknown(addon.id)) return Strings.Addons.new;
    }, [addon]);

    const className = useMemo(() => Utilities.className({ 
        "bd-addon-store-card": true, 
        "bd-addon-store-card-embed": isEmbed 
    }), [ isEmbed ]);

    const markAsSeen = useCallback(() => AddonStore.markAsKnown(addon.id), [addon]);

    const {downloads, likes} = useMemo(() => ({
        downloads: Strings.Addons.downloadCount.format({downloads: formatNumberWithSuffix(addon.downloads)}),
        likes: Strings.Addons.likeCount.format({likes: formatNumberWithSuffix(addon.likes)}),
    }), [addon]);

    return (
        <div className={className} onMouseEnter={markAsSeen}>
            <div className="bd-addon-store-card-splash">
                <div className="bd-addon-store-card-preview">
                    <img 
                        src={`https://betterdiscord.app${addon.thumbnail_url || "/resources/ui/content_thumbnail.svg"}`}
                        onError={(event) => {
                            event.currentTarget.src = "https://betterdiscord.app/resources/ui/content_thumbnail.svg";
                        }}
                        loading="lazy"
                        className="bd-addon-store-card-preview-img"
                        alt={`Thumbnail ${addon.name}`}
                    />
                </div>
                <div className="bd-addon-store-card-author">
                    <svg
                        height={48}
                        width={48}
                        className="bd-addon-store-card-author-svg"
                        viewBox="0 0 48 48"
                    >
                        <foreignObject
                            x={0}
                            y={0}
                            height={48}
                            width={48}
                            overflow="visible"
                            mask="url(#svg-mask-squircle)"
                        >
                            <div className="bd-addon-store-card-author-mask">
                                <svg
                                    height={40}
                                    width={40}
                                    className="bd-addon-store-card-author-svg"
                                    viewBox="0 0 40 40"
                                >
                                    <foreignObject
                                        x={0}
                                        y={0}
                                        height={40}
                                        width={40}
                                        overflow="visible"
                                        mask="url(#svg-mask-squircle)"
                                    >
                                        <img 
                                            loading="lazy"
                                            className="bd-addon-store-card-author-img"
                                            src={`https://cdn.discordapp.com/avatars/${addon.author.discord_snowflake}/${addon.author.discord_avatar_hash}.webp?size=80`}
                                            onError={(event) => {
                                                event.currentTarget.src = `https://avatars.githubusercontent.com/u/${addon.author.github_id}?v=4`;
                                            }}
                                        />
                                    </foreignObject>
                                </svg>
                            </div>
                        </foreignObject>
                    </svg>
                </div>
                {badge && (
                    <div className="bd-addon-store-card-badge">{badge}</div>
                )}
            </div>
            <div className="bd-addon-store-card-body">
                <div className="bd-addon-store-card-name">{addon.name}</div>
                <div className="bd-addon-store-card-description">{addon.description}</div>
                <div className="bd-addon-store-card-tags">
                    {addon.tags.map((tag) => (
                        <span
                            className={Utilities.className({"bd-addon-store-card-tag": true, "bd-addon-store-card-tag-selected": isTagEnabled(tag)})}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="bd-addon-store-card-info">
                    <div className="bd-addon-store-card-likes">
                        <div className="bd-addon-store-card-dot" />
                        <div className="bd-addon-store-card-value">{likes}</div>
                    </div>
                    <div className="bd-addon-store-card-downloads">
                        <div className="bd-addon-store-card-dot" />
                        <div className="bd-addon-store-card-value">{downloads}</div>
                    </div>
                </div>
                <div className="bd-addon-store-card-actions">
                    <DiscordModules.Tooltip text={Strings.Addons.source}>
                        {(props) => (
                            <Button
                                {...props}
                                size={Button.Sizes.ICON} 
                                look={Button.Looks.BLANK}
                                onClick={openAddonPage}
                            >
                                <Globe size={24} />
                            </Button>
                        )}
                    </DiscordModules.Tooltip>
                    <DiscordModules.Tooltip text={Strings.Addons.source}>
                        {(props) => (
                            <Button
                                {...props}
                                size={Button.Sizes.ICON} 
                                look={Button.Looks.BLANK}
                                onClick={openSourceCode}
                            >
                                <GitHub size={24} />
                            </Button>
                        )}
                    </DiscordModules.Tooltip>
                    {/* 
                        addon api v2 has no way to allow us to preview addons, 
                        as the dont provide the raw git url 

                        Maybe fetch the redirect to get the original URL, and convert that? 
                    */}
                    {/* <Button
                        size={Button.Sizes.ICON} 
                        look={Button.Looks.BLANK}
                        onClick={() => {
                            // TODO: open preview
                        }}
                    >
                        <GitHub size={24} />
                    </Button> */}
                    {(addon.guild || addon.author.guild) && (
                        <DiscordModules.Tooltip text={Strings.Addons.invite}>
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON} 
                                    look={Button.Looks.BLANK}
                                    onClick={acceptInvite}
                                >
                                    <Support size={24} />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    )}
                    <div className="bd-addon-store-card-spacer" />
                    {isInstalled ? (
                        <DiscordModules.Tooltip text={Strings.Addons.deleteAddon}>
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON}
                                    color={Button.Colors.BRAND}
                                    onClick={triggerDelete}
                                >
                                    <Delete size={24} />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    ) : (
                        <DiscordModules.Tooltip text={Strings.Addons.downloadAddon}>
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON}
                                    color={Button.Colors.BRAND}
                                    onClick={installAddon}
                                    disabled={disabled}
                                >
                                    <Download size={24} />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
}