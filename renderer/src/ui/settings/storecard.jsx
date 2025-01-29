import clsx from "clsx";
import Web from "@data/web";

import React from "@modules/react";
import Strings from "@modules/strings";
import DiscordModules from "@modules/discordmodules";
import Events from "@modules/emitter";

import Button from "@ui/base/button";
import GitHub from "@ui/icons/github";
import Support from "@ui/icons/support";
import Globe from "@ui/icons/globe";
import Eye from "@ui/icons/eye";
import {FlowerStar} from "./addonshared";
import Delete from "@ui/icons/delete";

const {useCallback, useMemo, useState, useEffect, useContext, createContext} = React;

export const TagContext = createContext();

function formatNumberWithSuffix(value) {
    if (value === 0) return "0";
  
    const suffixes = ["", "k", "M", "B", "T"]; 
    const index = Math.floor(Math.log10(Math.abs(value)) / 3);
    const divisor = Math.pow(10, index * 3);

    let formattedValue = (value / divisor).toFixed(1);
    if (formattedValue.endsWith(".0")) formattedValue = formattedValue.slice(0, -2);
  
    return `${formattedValue}${suffixes[index]}`;
}

/**
 * @param {{ addon: import("@modules/addonstore").Addon, isEmbed?: boolean }} props 
 */
export default function AddonCard({addon, isEmbed}) {
    const [isInstalled, setInstalled] = useState(() => addon.isInstalled());
    const [disabled, setDisabled] = useState(false);
    const [downloadCount, setDownloads] = useState(addon.downloads);

    const [isTagEnabled, toggleTag] = useContext(TagContext);

    const triggerDelete = useCallback((event) => addon.delete(event.shiftKey), [addon]);

    const installAddon = useCallback(async (event) => {
        setDisabled(true);
        
        await addon.download(event.shiftKey);

        setDownloads(addon.downloads);

        setDisabled(false);
    }, [addon]);

    const acceptInvite = useCallback(() => addon.guild.join(), [addon]);
    const openSourceCode = useCallback(() => addon.openSourceCode(), [addon]);
    const openAddonPage = useCallback(() => addon.openAddonPage(), [addon]);
    const openAddonPreview = useCallback(() => addon.openPreview(), [addon]);
    const openAuthorPage = useCallback(() => addon.openAuthorPage(), [addon]);

    useEffect(() => {
        const listener = () => {
            setInstalled(addon.isInstalled());
        };

        listener();
        
        Events.on(`${addon.manager.prefix}-loaded`, listener);
        Events.on(`${addon.manager.prefix}-unloaded`, listener);
        
        return () => {
            Events.off(`${addon.manager.prefix}-loaded`, listener);
            Events.off(`${addon.manager.prefix}-unloaded`, listener);
        };
    }, [addon]);

    const badge = useMemo(() => {
        if (addon.isUnknown()) return Strings.Addons.new;
        if (addon.recentlyUpdated()) return Strings.Addons.updated;
    }, [addon]);

    const {downloads, likes} = useMemo(() => ({
        downloads: Strings.Addons.downloadCount.format({downloads: formatNumberWithSuffix(downloadCount)}),
        likes: Strings.Addons.likeCount.format({likes: formatNumberWithSuffix(addon.likes)}),
    }), [addon, downloadCount]);

    return (
        <div 
            className={clsx({ 
                "bd-addon-store-card": true, 
                "bd-addon-store-card-embed": isEmbed 
            })} 
            onMouseEnter={() => {
                addon.markAsKnown();
            }}
        >
            <div className="bd-addon-store-card-splash">
                <div className="bd-addon-store-card-preview">
                    <img 
                        src={addon.thumbnail}
                        onError={(event) => {
                            // Fallback to blank thumbnail
                            event.currentTarget.src = Web.resources.thumbnail();
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
                                        <DiscordModules.Tooltip text={addon.author}>
                                            {(props) => (
                                                <img 
                                                    loading="lazy"
                                                    className="bd-addon-store-card-author-img"
                                                    src={addon.avatar}
                                                    {...props}
                                                    onClick={openAuthorPage}
                                                />
                                            )}
                                        </DiscordModules.Tooltip>
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
                <div className="bd-addon-store-card-name">
                    <FlowerStar />
                    <span>{addon.name}</span>
                </div>
                <div className="bd-addon-store-card-description">{addon.description}</div>
                <div className="bd-addon-store-card-tags">
                    {addon.tags.map((tag) => (
                        <span
                            className={clsx({"bd-addon-store-card-tag": true, "bd-addon-store-card-tag-selected": isTagEnabled(tag)})}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="bd-addon-store-card-spacer" />
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
                    <DiscordModules.Tooltip text={Strings.Addons.website}>
                        {(props) => (
                            <Button
                                {...props}
                                size={Button.Sizes.ICON} 
                                look={Button.Looks.BLANK}
                                onClick={openAddonPage}
                            >
                                <Globe size={18} />
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
                                <GitHub size={18} />
                            </Button>
                        )}
                    </DiscordModules.Tooltip>
                    {addon.type === "theme" && (
                        <DiscordModules.Tooltip text={Strings.Addons.preview}>
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON} 
                                    look={Button.Looks.BLANK}
                                    onClick={openAddonPreview}
                                >
                                    <Eye size={18} />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    )}
                    {addon.guild && (
                        <DiscordModules.Tooltip text={Strings.Addons.invite}>
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON} 
                                    look={Button.Looks.BLANK}
                                    onClick={acceptInvite}
                                >
                                    <Support size={18} />
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
                                    onClick={triggerDelete} 
                                    color={Button.Colors.RED} 
                                    size={Button.Sizes.ICON}
                                >
                                    <Delete size={24} />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    ) : (
                        <Button onClick={installAddon} disabled={disabled}>
                            {Strings.Addons.downloadAddon}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
