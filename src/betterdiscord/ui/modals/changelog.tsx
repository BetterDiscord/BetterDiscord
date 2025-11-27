import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import {t} from "@common/i18n";

import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Flex from "../base/flex";
import Text from "../base/text";
import CloseButton from "./close";

import SimpleMarkdownExt from "@structs/markdown";
import Modals from "@ui/modals";
import {GithubIcon, TwitterIcon} from "lucide-react";
import {getByKeys} from "@webpack";
import type {MouseEvent, ReactNode} from "react";

const {useMemo} = React;


const AnchorClasses: {anchor: string; anchorUnderlineOnHover: string;} = getByKeys(["anchorUnderlineOnHover"]) || {anchor: "anchor-3Z-8Bb", anchorUnderlineOnHover: "anchorUnderlineOnHover-2ESHQB"};
const joinSupportServer = (click: MouseEvent) => {
    click.preventDefault();
    click.stopPropagation();
    Modals.showGuildJoinModal("pwXhuRkmgy");
    DiscordModules.Dispatcher?.dispatch({type: "LAYER_POP"});
};

const supportLink = <a className={`${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`} onClick={joinSupportServer}>Join our Discord Server.</a>;
const defaultFooter = <Text>Need support? {supportLink}</Text>;

const twitter = <DiscordModules.Tooltip color="primary" position="top" text={t("Socials.twitter")}>
    {p => <a {...p} className="bd-social" href="https://x.com/_BetterDiscord_" rel="noopener noreferrer" target="_blank">
        <TwitterIcon size="18px" />
    </a>}
</DiscordModules.Tooltip>;

const github = <DiscordModules.Tooltip color="primary" position="top" text={t("Socials.github")}>
    {p => <a {...p} className="bd-social" href="https://github.com/BetterDiscord/BetterDiscord" rel="noopener noreferrer" target="_blank">
        <GithubIcon size="18px" />
    </a>}
</DiscordModules.Tooltip>;

function YoutubeEmbed({src}: {src: string;}) {
    return <iframe
        src={src}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
    />;
}

function Video({src, poster}: {src: string; poster?: string;}) {
    if (src.toLowerCase().includes("youtube.com")) return <YoutubeEmbed src={src} />;
    return <video src={src} poster={poster} controls={true} className="bd-changelog-poster" />;
}

export type ChangelogEntryType = "progress" | "fixed" | "added" | "improved";
export interface ChangelogEntry {
    type: ChangelogEntryType;
    blurb?: string;
    title: string;
    items: string[];
}

export interface ChangelogProps {
    transitionState?: number;
    footer?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    onClose?(): void;
    video?: string;
    poster?: string;
    banner?: string;
    blurb?: string;
    changes?: ChangelogEntry[];
}

export default function ChangelogModal({transitionState, footer, title, subtitle, onClose, video, poster, banner, blurb, changes}: ChangelogProps) {

    const ChangelogHeader = useMemo(() => <Header justify={Flex.Justify.BETWEEN}>
        <Flex direction={Flex.Direction.VERTICAL}>
            <Text tag="h1" size={Text.Sizes.SIZE_20} strong={true}>{title}</Text>
            <Text size={Text.Sizes.SIZE_12} color={Text.Colors.MUTED}>{subtitle}</Text>
        </Flex>
        <CloseButton onClick={onClose} />
    </Header>, [title, subtitle, onClose]);

    const ChangelogFooter = useMemo(() => <Footer justify={Flex.Justify.BETWEEN} direction={Flex.Direction.HORIZONTAL}>
        <Flex.Child grow="1" shrink="1">
            {footer ? footer : defaultFooter}
        </Flex.Child>
        {!footer && <Flex.Child grow="0" shrink="0">
            {twitter}
            {github}
        </Flex.Child>}
    </Footer>, [footer]);

    const changelogItems = useMemo(() => {
        const items = [];
        if (video) items.push(<Video src={video} poster={poster} />);
        else if (banner) items.push(<img src={banner} className="bd-changelog-poster" />);

        if (blurb) items.push(<p>{SimpleMarkdownExt.parseToReact(blurb)}</p>);

        for (let c = 0; c < (changes?.length ?? 0); c++) {
            const entry = changes![c];
            const type = "bd-changelog-" + entry.type;
            const margin = c == 0 ? " bd-changelog-first" : "";
            items.push(<h1 className={`bd-changelog-title ${type}${margin}`}>{entry.title}</h1>);
            if (entry.blurb) items.push(<p>{SimpleMarkdownExt.parseToReact(entry.blurb)}</p>);
            const list = <ul>{entry.items.map(i => <li>{SimpleMarkdownExt.parseToReact(i)}</li>)}</ul>;
            items.push(list);
        }
        return items;
    }, [blurb, video, banner, poster, changes]);

    return <Root className="bd-changelog-modal" transitionState={transitionState} size={Root.Sizes.MEDIUM} style={Root.Styles.STANDARD}>
        {ChangelogHeader}
        <Content>{changelogItems}</Content>
        {(footer || title === "BetterDiscord") && ChangelogFooter}
    </Root>;
}