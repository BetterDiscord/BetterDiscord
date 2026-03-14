import clsx from "clsx";
import Web from "@data/web";

import React from "@modules/react";
import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";
import Events from "@modules/emitter";

import Button from "@ui/base/button";
import {FlowerStar} from "./addonshared";
import {CircleHelpIcon, EyeIcon, GithubIcon, GlobeIcon, Trash2Icon} from "lucide-react";
import type {AddonStore} from "@modules/addonstore";

const {useCallback, useMemo, useState, useEffect, useContext, createContext} = React;

// TODO: let doggy fix these
export const TagContext = createContext();

function formatNumberWithSuffix(value) {
    value = Number(value);
    if (value === 0) return "0";

    const suffixes = ["", "k", "M", "B", "T"];
    const index = Math.floor(Math.log10(Math.abs(value)) / 3);
    const divisor = Math.pow(10, index * 3);

    let formattedValue = (value / divisor).toFixed(1);
    if (formattedValue.endsWith(".0")) formattedValue = formattedValue.slice(0, -2);

    return `${formattedValue}${suffixes[index]}`;
}

export default function AddonCard({addonStore, isEmbed}: {addonStore: AddonStore, isEmbed: boolean;}) {
    const [isInstalled, setInstalled] = useState(() => addonStore.isInstalled());
    const [disabled, setDisabled] = useState(false);
    const [downloadCount, setDownloads] = useState(addonStore.downloads);

    const [isTagEnabled, toggleTag] = useContext(TagContext);

    const triggerDelete = useCallback(async (event) => {
        setDisabled(true);
        try {
            await addonStore.delete(event.shiftKey);
            // Manually sync state after delete completes
            setInstalled(addonStore.isInstalled());
        }
        finally {
            setDisabled(false);
        }
    }, [addonStore]);

    const installAddon = useCallback(async (event) => {
        setDisabled(true);

        await addonStore.download(event.shiftKey);

        setDownloads(addonStore.downloads);

        setDisabled(false);
    }, [addonStore]);

    const acceptInvite = useCallback(() => addonStore.guild.join(), [addonStore]);
    const openSourceCode = useCallback(() => addonStore.openSourceCode(), [addonStore]);
    const openAddonPage = useCallback(() => addonStore.openAddonPage(), [addonStore]);
    const openAddonPreview = useCallback(() => addonStore.openPreview(), [addonStore]);
    const openAuthorPage = useCallback(() => addonStore.openAuthorPage(), [addonStore]);

    useEffect(() => {
        const listener = () => {
            setInstalled(addonStore.isInstalled());
        };

        listener();

        Events.on(`${addonStore.manager.prefix}-loaded`, listener);
        Events.on(`${addonStore.manager.prefix}-unloaded`, listener);

        return () => {
            Events.off(`${addonStore.manager.prefix}-loaded`, listener);
            Events.off(`${addonStore.manager.prefix}-unloaded`, listener);
        };
    }, [addonStore]);

    const badge = useMemo(() => {
        if (addonStore.isUnknown()) return t("Addons.new");
        if (addonStore.recentlyUpdated()) return t("Addons.updated");
    }, [addonStore]);

    const {downloads, likes} = useMemo(() => ({
        downloads: t("Addons.downloadCount", {count: downloadCount}, {count: formatNumberWithSuffix}),
        likes: t("Addons.likeCount", {count: addonStore.likes}, {count: formatNumberWithSuffix}),
    }), [addonStore, downloadCount]);

    return (
        <div
            className={clsx({
                "bd-addon-store-card": true,
                "bd-addon-store-card-embed": isEmbed
            })}
            onMouseEnter={() => {
                addonStore.markAsKnown();
            }}
        >
            <div className="bd-addon-store-card-splash">
                <div className="bd-addon-store-card-preview">
                    <img
                        src={addonStore.thumbnail}
                        onError={(event) => {
                            // Fallback to blank thumbnail
                            event.currentTarget.src = Web.resources.thumbnail();
                        }}
                        loading="lazy"
                        className="bd-addon-store-card-preview-img"
                        alt={`Thumbnail ${addonStore.name}`}
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
                                        <DiscordModules.Tooltip text={addonStore.author}>
                                            {(props) => (
                                                <img
                                                    loading="lazy"
                                                    className="bd-addon-store-card-author-img"
                                                    src={addonStore.avatar}
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
                    <span>{addonStore.name}</span>
                </div>
                <div className="bd-addon-store-card-description">{addonStore.description}</div>
                <div className="bd-addon-store-card-tags">
                    {addonStore.tags.map((tag) => (
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
                    <DiscordModules.Tooltip text={t("Addons.website")}>
                        {(props) => (
                            <Button
                                {...props}
                                size={Button.Sizes.ICON}
                                look={Button.Looks.BLANK}
                                onClick={openAddonPage}
                            >
                                <GlobeIcon size="20px" />
                            </Button>
                        )}
                    </DiscordModules.Tooltip>
                    <DiscordModules.Tooltip text={t("Addons.source")}>
                        {(props) => (
                            <Button
                                {...props}
                                size={Button.Sizes.ICON}
                                look={Button.Looks.BLANK}
                                onClick={openSourceCode}
                            >
                                <GithubIcon size="20px" />
                            </Button>
                        )}
                    </DiscordModules.Tooltip>
                    {addonStore.type === "theme" && (
                        <DiscordModules.Tooltip text={t("Addons.preview")}>
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON}
                                    look={Button.Looks.BLANK}
                                    onClick={openAddonPreview}
                                >
                                    <EyeIcon size="20px" />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    )}
                    {addonStore.guild && (
                        <DiscordModules.Tooltip text={t("Addons.invite")}>
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON}
                                    look={Button.Looks.BLANK}
                                    onClick={acceptInvite}
                                >
                                    <CircleHelpIcon size="20px" />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    )}
                    <div className="bd-addon-store-card-spacer" />
                    {isInstalled ? (
                        <DiscordModules.Tooltip text={t("Addons.deleteAddon")}>
                            {(props) => (
                                <Button
                                    {...props}
                                    onClick={triggerDelete}
                                    color={Button.Colors.RED}
                                    size={Button.Sizes.ICON}
                                >
                                    <Trash2Icon size="20px" />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    ) : (
                        <Button onClick={installAddon} disabled={disabled}>
                            {t("Addons.downloadAddon")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
