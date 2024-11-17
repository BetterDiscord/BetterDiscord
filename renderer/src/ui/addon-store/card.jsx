import React from "@modules/react";
import Strings from "@modules/strings";
import DiscordModules from "@modules/discordmodules";
import Events from "@modules/emitter";

import Button from "@ui/base/button";
import Delete from "@ui/icons/delete";
import Download from "@ui/icons/download";
import GitHub from "@ui/icons/github";
import Support from "@ui/icons/support";
import Utilities from "@modules/utilities";
import Globe from "@ui/icons/globe";
import {TagContext} from "./page";
import Eye from "@ui/icons/eye";
import Web from "@data/web";
// import Extension from "@ui/icons/extension";
// import Theme from "@ui/icons/theme";

const {useCallback, useMemo, useState, useEffect, useContext} = React;

function formatNumberWithSuffix(value) {
    if (value === 0) return "0";
  
    const suffixes = ["", "k", "M", "B", "T"]; 
    const index = Math.floor(Math.log10(Math.abs(value)) / 3);
    const divisor = Math.pow(10, index * 3);

    let formattedValue = (value / divisor).toFixed(1);
    if (formattedValue.endsWith(".0")) formattedValue = formattedValue.slice(0, -2);
  
    return `${formattedValue}${suffixes[index]}`; // Concatenate the formatted number with the suffix
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

    // Maybe show the guild invite confirm modal?
    const acceptInvite = useCallback(() => addon.joinGuild(), [addon]);
    const openSourceCode = useCallback(() => addon.openRawCode(), [addon]);
    const openAddonPage = useCallback(() => addon.openAddonPage(), [addon]);
    const openAddonPreview = useCallback(() => addon.openAddonPreview(), [addon]);

    useEffect(() => {
        setInstalled(addon.isInstalled());

        const listener = () => setInstalled(addon.isInstalled());
        
        Events.on(`${addon.manager.prefix}-loaded`, listener);
        Events.on(`${addon.manager.prefix}-unloaded`, listener);
        
        return () => {
            Events.off(`${addon.manager.prefix}-loaded`, listener);
            Events.off(`${addon.manager.prefix}-unloaded`, listener);
        };
    }, [addon]);

    const badgeText = useMemo(() => {
        if (addon.isUnknown()) return Strings.Addons.new;
    }, [addon]);

    const className = useMemo(() => Utilities.className({ 
        "bd-addon-store-card": true, 
        "bd-addon-store-card-embed": isEmbed 
    }), [ isEmbed ]);

    const markAsSeen = useCallback(() => addon.markAsKnown(), [addon]);

    const {downloads, likes} = useMemo(() => ({
        downloads: Strings.Addons.downloadCount.format({downloads: formatNumberWithSuffix(downloadCount)}),
        likes: Strings.Addons.likeCount.format({likes: formatNumberWithSuffix(addon.likes)}),
    }), [addon, downloadCount]);

    return (
        <div className={className} onMouseEnter={markAsSeen}>
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
                                                />
                                            )}
                                        </DiscordModules.Tooltip>
                                    </foreignObject>
                                </svg>
                            </div>
                        </foreignObject>
                    </svg>
                </div>
                {badgeText && (
                    <div className="bd-addon-store-card-badge">{badgeText}</div>
                )}
            </div>
            <div className="bd-addon-store-card-body">
                <div className="bd-addon-store-card-name">
                    {/* {addon.type === "plugin" ? <Extension size={16.5} /> : <Theme size={22} />} */}
                    <span>{addon.name}</span>
                </div>
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
                    <DiscordModules.Tooltip text={Strings.Addons.website}>
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
                    {addon.type === "theme" && (
                        <DiscordModules.Tooltip text={Strings.Addons.preview}>
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON} 
                                    look={Button.Looks.BLANK}
                                    onClick={openAddonPreview}
                                >
                                    <Eye size={24} />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    )}
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
                        <DiscordModules.Tooltip text={Strings.Addons.deleteAddon} key="delete">
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON}
                                    color={Button.Colors.RED}
                                    onClick={triggerDelete}
                                >
                                    <Delete size={24} />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    ) : (
                        <DiscordModules.Tooltip text={Strings.Addons.downloadAddon} key="download">
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