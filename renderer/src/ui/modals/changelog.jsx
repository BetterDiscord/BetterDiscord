import React from "@modules/react";
import WebpackModules from "@modules/webpackmodules";
import DiscordModules from "@modules/discordmodules";
import Strings from "@modules/strings";

import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Flex from "../base/flex";
import Text from "../base/text";
import CloseButton from "./close";

import SimpleMarkdownExt from "@structs/markdown";
import Twitter from "@ui/icons/twitter";
import GitHub from "@ui/icons/github";

const {useMemo} = React;


const AnchorClasses = WebpackModules.getByProps("anchorUnderlineOnHover") || {anchor: "anchor-3Z-8Bb", anchorUnderlineOnHover: "anchorUnderlineOnHover-2ESHQB"};
const joinSupportServer = (click) => {
    click.preventDefault();
    click.stopPropagation();
    DiscordModules.InviteActions.acceptInviteAndTransitionToInviteChannel({inviteKey: "0Tmfo5ZbORCRqbAd"});
};

const supportLink = <a className={`${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`} onClick={joinSupportServer}>Join our Discord Server.</a>;
const defaultFooter = <Text>Need support? {supportLink}</Text>;

const twitter = <DiscordModules.Tooltip color="primary" position="top" text={Strings.Socials.twitter}>
    {p => <a {...p} className="bd-social" href="https://x.com/_BetterDiscord_" rel="noopener noreferrer" target="_blank">
        <Twitter />
        </a>}
    </DiscordModules.Tooltip>;

const github = <DiscordModules.Tooltip color="primary" position="top" text={Strings.Socials.github}>
    {p => <a {...p} className="bd-social" href="https://github.com/BetterDiscord/BetterDiscord" rel="noopener noreferrer" target="_blank">
        <GitHub />
        </a>}
    </DiscordModules.Tooltip>;

function YoutubeEmbed({src}) {
    return <iframe
            src={src}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        />;
}

function Video({src, poster}) {
    if (src.toLowerCase().includes("youtube.com")) return <YoutubeEmbed src={src} />;
    return <video src={src} poster={poster} controls={true} className="bd-changelog-poster" />;
}


export default function ChangelogModal({transitionState, footer, title, subtitle, onClose, video, poster, banner, blurb, changes}) {

    const ChangelogHeader = useMemo(() => <Header justify={Flex.Justify.BETWEEN}>
        <Flex direction={Flex.Direction.VERTICAL}>
            <Text tag="h1" size={Text.Sizes.SIZE_20} strong={true}>{title}</Text>
            <Text size={Text.Sizes.SIZE_12} color={Text.Colors.HEADER_SECONDARY}>{subtitle}</Text>
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

        for (let c = 0; c < changes?.length; c++) {
            const entry = changes[c];
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