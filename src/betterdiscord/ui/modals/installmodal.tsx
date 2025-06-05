import DiscordModules from "@modules/discordmodules";
import LocaleManager from "@modules/localemanager";
import React from "@modules/react";
import Settings from "@stores/settings";
import {t} from "@common/i18n";
import Web from "@data/web";
import Events from "@modules/emitter";

import Button from "@ui/base/button";
import Flex from "@ui/base/flex";
import Text from "@ui/base/text";
import Footer from "@ui/modals/footer";
import ModalRoot from "@ui/modals/root";
import CheckBox from "@ui/settings/components/checkbox";
import Spinner from "@ui/spinner";
import {FlowerStar} from "@ui/settings/addonshared";
import {CircleHelpIcon, ClockIcon, GithubIcon, InfoIcon, TagIcon, UserIcon} from "lucide-react";
import type {MouseEvent, ReactNode} from "react";


const {useLayoutEffect, useCallback, useState, useRef} = React;

function ModalItem({leading, content, trailing, action}: {leading?: ReactNode, content?: ReactNode, trailing?: ReactNode, action?: (e: MouseEvent<HTMLDivElement>) => void;}) {
    return (
        <Flex onClick={action} className={`bd-install-modal-item${typeof action === "function" ? " bd-install-modal-clickable" : ""}`} align={Flex.Align.CENTER}>
            {leading && <div className="bd-install-modal-item-leading">{leading}</div>}
            {content && <div className="bd-install-modal-item-content">{content}</div>}
            {trailing && <div className="bd-install-modal-item-trailing">{trailing}</div>}
        </Flex>
    );
}


// TODO: let doggy do these types
/**
 * @param {{guild: import("@modules/addonstore").Guild}} props
 */
function GuildIcon({guild}) {
    const [state, setState] = useState(() => guild.hash?.trim() ? 0 : 2);
    /** @type {{ current: HTMLDivElement | null }} */
    const ref = useRef();

    // Lazy image effect
    useLayoutEffect(() => {
        if (!guild.hash?.trim()) return;

        let img = new Image();

        const onLoad = () => {
            try {
                ref.current.append(img);
                setState(1);
            }
            finally {
                removeListeners();
            }
        };
        const onError = () => {
            setState(2);
            removeListeners();
            // Allow garbage collecting
            img = null;
        };

        const removeListeners = () => {
            if (!img) return;

            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onError);
        };

        img.addEventListener("load", onLoad);
        img.addEventListener("error", onError);

        img.src = guild.url;

        return removeListeners;
    }, [guild]);

    return (
        <div className="bd-install-modal-guild" ref={ref}>
            {state === 0 ? <Spinner type={Spinner.Type.PULSING_ELLIPSIS} /> : state === 1 ? null : guild.acronym}
        </div>
    );
}

/**
 * @param {{
 *    addon: import("@modules/addonstore").Addon,
 *    transitionState: number,
 *    onClose(): void,
 *    install(shouldEnable: boolean): Promise<void>
 * }} props
 */
export default function InstallModal({addon, transitionState, install, onClose}) {
    const [shouldEnable, setShouldEnable] = useState(() => Settings.get("settings", "store", "alwaysEnable"));

    const openAuthorPage = useCallback(() => addon.openAuthorPage(), [addon]);
    const attemptJoinGuild = useCallback(() => addon.guild.join(), [addon]);
    const openSourceCode = useCallback(() => addon.openSourceCode(), [addon]);

    const [isInstalling, setInstalling] = useState(false);

    const doInstall = useCallback(() => {
        setInstalling(true);
        install(shouldEnable).catch(() => onClose());
    }, [install, shouldEnable, onClose]);

    useLayoutEffect(() => {
        if (addon.isInstalled()) return onClose();

        const listener = () => {
            if (addon.isInstalled()) onClose();
        };

        Events.on(`${addon.type}-loaded`, listener);
        return () => Events.off(`${addon.type}-loaded`, listener);
    }, [addon, onClose]);

    return (
        <ModalRoot transitionState={transitionState} size={ModalRoot.Sizes.SMALL} className="bd-addon-store-modal">
            <div className="bd-install-modal-splash">
                <div className="bd-install-modal-preview">
                    <img
                        src={addon.thumbnail}
                        onError={(event) => {
                            // Fallback to blank thumbnail
                            event.currentTarget.src = Web.resources.thumbnail();
                        }}
                        loading="lazy"
                        className="bd-install-modal-preview-img"
                        alt={`Thumbnail ${addon.name}`}
                    />
                </div>
                <div className="bd-install-modal-author">
                    <svg
                        height={48}
                        width={48}
                        className="bd-install-modal-author-svg"
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
                            <div className="bd-install-modal-author-mask">
                                <svg
                                    height={40}
                                    width={40}
                                    className="bd-install-modal-author-svg"
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
                                                    className="bd-install-modal-author-img"
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
            </div>
            <div className="bd-install-modal-header">
                <FlowerStar size={20} />
                <Text size={Text.Sizes.SIZE_20} color={Text.Colors.HEADER_PRIMARY}>{addon.name}</Text>
            </div>
            <div className="bd-install-modal-items">
                <ModalItem
                    leading={<InfoIcon size="24px" />}
                    content={addon.description}
                />
                <ModalItem
                    leading={<TagIcon size="24px" />}
                    content={addon.version}
                />
                <ModalItem
                    leading={<ClockIcon size="24px" />}
                    content={addon.lastModified.toLocaleString(LocaleManager.discordLocale)}
                />
                <ModalItem
                    leading={<GithubIcon size="24px" />}
                    content={addon.filename}
                    action={openSourceCode}
                />
                <ModalItem
                    leading={<UserIcon size="24px" />}
                    content={addon.author}
                    action={openAuthorPage}
                />
                {addon.guild && (
                    <ModalItem
                        leading={<CircleHelpIcon size="24px" />}
                        content={(
                            <Flex direction={Flex.Direction.VERTICAL}>
                                <Text>{addon.guild.name}</Text>
                                <Text size={Text.Sizes.SIZE_12} color={Text.Colors.MUTED}>{t("Addons.invite")}</Text>
                            </Flex>
                        )}
                        trailing={<GuildIcon guild={addon.guild} />}
                        action={attemptJoinGuild}
                    />
                )}
            </div>
            <Footer justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
                <Button onClick={doInstall} disabled={isInstalling}>
                    {isInstalling ? <Spinner type={Spinner.Type.PULSING_ELLIPSIS} /> : t("Addons.downloadAddon")}
                </Button>
                <CheckBox
                    value={shouldEnable}
                    onChange={setShouldEnable}
                    label={<Text>{t("Modals.automaticallyEnable")}</Text>}
                />
            </Footer>
        </ModalRoot>
    );
}