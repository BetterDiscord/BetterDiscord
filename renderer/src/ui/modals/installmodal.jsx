import AddonStore from "@modules/addonstore";
import DiscordModules from "@modules/discordmodules";
import LocaleManager from "@modules/localemanager";
import React from "@modules/react";
import Strings from "@modules/strings";

import Button from "@ui/base/button";
import Flex from "@ui/base/flex";
import Text from "@ui/base/text";
import Clock from "@ui/icons/clock";
import GitHub from "@ui/icons/github";
import Info from "@ui/icons/info";
import Support from "@ui/icons/support";
import Tag from "@ui/icons/tag";
import User from "@ui/icons/user";
import Footer from "@ui/modals/footer";
import ModalRoot from "@ui/modals/root";
import CheckBox from "@ui/settings/components/checkbox";
import Spinner from "@ui/spinner";

const {useCallback, useState} = React;

function ModalItem({leading, content, trailing, action}) {
    return (
        <Flex onClick={action} className={`bd-install-modal-item${typeof action === "function" ? " bd-install-modal-clickable" : ""}`} align={Flex.Align.CENTER}>
            {leading && <div className="bd-install-modal-item-leading">{leading}</div>}
            {content && <div className="bd-install-modal-item-content">{content}</div>}
            {trailing && <div className="bd-install-modal-item-trailing">{trailing}</div>}
        </Flex>
    );
}

/**
 * 
 * @param {{ 
 *    addon: import("@modules/addonstore").RawAddon, 
 *    transitionState: number, 
 *    onClose(): void, 
 *    install(shouldEnable: boolean): Promise<void>
 * }} param0 
 * @returns 
 */
export default function DownloadModal({addon, transitionState, install}) {
    const guild = addon.guild || addon.author.guild;
    const [shouldEnable, setShouldEnable] = useState(() => AddonStore.shouldAlwaysEnable);

    const openAuthorPage = useCallback(() => AddonStore.openAuthorPage(addon), [addon]);
    const attemptJoinGuild = useCallback(() => AddonStore.attemptToJoinGuild(addon), [addon]);
    const openSourceCode = useCallback(() => AddonStore.openRawCode(addon), [addon]);

    const [isInstalling, setInstalling] = useState(false);

    const doInstall = useCallback(() => {
        setInstalling(true);
        install(shouldEnable);
    }, [install, shouldEnable]);

    return (
        <ModalRoot transitionState={transitionState} size={ModalRoot.Sizes.SMALL} className="bd-addon-store-modal">
            <div className="bd-install-modal-splash">
                <div className="bd-install-modal-preview">
                    <img 
                        src={`https://betterdiscord.app${addon.thumbnail_url || "/resources/ui/content_thumbnail.svg"}`}
                        onError={(event) => {
                            // Fallback to blank thumbnail
                            event.currentTarget.src = "https://betterdiscord.app/resources/ui/content_thumbnail.svg";
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
                                        <DiscordModules.Tooltip text={addon.author.display_name}>
                                            {(props) => (
                                                <img 
                                                    loading="lazy"
                                                    className="bd-install-modal-author-img"
                                                    src={`https://avatars.githubusercontent.com/u/${addon.author.github_id}?v=4`}
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
                {/* <CloseButton onClick={onClose} /> */}
            </div>
            <div className="bd-install-modal-header"><Text size={Text.Sizes.SIZE_20} color={Text.Colors.HEADER_PRIMARY}>{addon.name}</Text></div>
            <div className="bd-install-modal-items">
                <ModalItem 
                    leading={<Info size={24} />}
                    content={addon.description}
                />
                <ModalItem 
                    leading={<Tag size={24} />}
                    content={addon.version}
                />
                <ModalItem 
                    leading={<Clock size={24} />}
                    content={new Date(addon.release_date).toLocaleString(LocaleManager.discordLocale)}
                />
                <ModalItem 
                    leading={<GitHub size={24} />}
                    content={addon.file_name}
                    action={openSourceCode}
                />
                <ModalItem 
                    leading={<User size={24} />}
                    content={addon.author.display_name}
                    action={openAuthorPage}
                />
                {guild && (
                    <ModalItem 
                        leading={<Support size={24} />}
                        content={(
                            <Flex direction={Flex.Direction.VERTICAL}>
                                <Text>{guild.name}</Text>
                                <Text size={Text.Sizes.SIZE_12} color={Text.Colors.MUTED}>{Strings.Addons.invite}</Text>
                            </Flex>
                        )}
                        trailing={(
                            <img 
                                src={`https://cdn.discordapp.com/icons/${guild.snowflake}/${guild.avatar_hash}.webp?size=96`}
                                alt={guild.id}
                                className="bd-install-modal-guild"
                                width={32}
                                height={32}
                            />
                        )}
                        action={attemptJoinGuild}
                    />
                )}
            </div>
            <Footer justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
                <Button onClick={doInstall} disabled={isInstalling}>
                    {isInstalling ? <Spinner type="pulsingEllipsis" /> : Strings.Addons.downloadAddon}
                </Button>
                <CheckBox 
                    value={shouldEnable} 
                    onChange={setShouldEnable} 
                    label={<Text>{Strings.Modals.automaticallyEnable}</Text>} 
                />
            </Footer>
        </ModalRoot>
    );
}