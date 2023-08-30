import React from "@modules/react";
import WebpackModules from "@modules/webpackmodules";
import DiscordModules from "@modules/discordmodules";

import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Flex from "../base/flex";
import Text from "../base/text";
import CloseButton from "./close";

import SimpleMarkdownExt from "@structs/markdown";

const {useMemo} = React;


const AnchorClasses = WebpackModules.getByProps("anchorUnderlineOnHover") || {anchor: "anchor-3Z-8Bb", anchorUnderlineOnHover: "anchorUnderlineOnHover-2ESHQB"};
const joinSupportServer = (click) => {
    click.preventDefault();
    click.stopPropagation();
    DiscordModules.InviteActions.acceptInviteAndTransitionToInviteChannel({inviteKey: "0Tmfo5ZbORCRqbAd"});
};

const supportLink = <a className={`${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`} onClick={joinSupportServer}>Join our Discord Server.</a>;
const defaultFooter = <Text>Need support? {supportLink}</Text>;


export default function ChangelogModal({transitionState, footer, title, subtitle, onClose, video, poster, banner, blurb, changes}) {

    const ChangelogHeader = useMemo(() => <Header justify={Flex.Justify.BETWEEN}>
        <Flex direction={Flex.Direction.VERTICAL}>
            <Text tag="h1" size={Text.Sizes.SIZE_20} strong={true}>{title}</Text>
            <Text size={Text.Sizes.SIZE_12} color={Text.Colors.HEADER_SECONDARY}>{subtitle}</Text>
        </Flex>
        <CloseButton onClick={onClose} />
    </Header>, [title, subtitle, onClose]);

    const ChangelogFooter = useMemo(() => {
        if (footer === false) return null;

        let toRender = defaultFooter;
        if (typeof(footer) === "string") toRender = <Text>{SimpleMarkdownExt.parseToReact(footer)}</Text>;
        else if (footer) toRender = footer;

        return <Footer>
            <Flex.Child grow="1" shrink="1">
                {toRender}
            </Flex.Child>
        </Footer>;
    }, [footer]);

    const changelogItems = useMemo(() => {
        const items = [video ? <video src={video} poster={poster} controls={true} className="bd-changelog-poster" /> : banner ? <img src={banner} className="bd-changelog-poster" /> : null];
        if (blurb) items.push(<p>{SimpleMarkdownExt.parseToReact(blurb, false)}</p>);
        for (let c = 0; c < changes.length; c++) {
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

    return <Root className="bd-changelog-modal" transitionState={transitionState} size={Root.Sizes.SMALL} style={Root.Styles.STANDARD}>
        {ChangelogHeader}
        <Content>{changelogItems}</Content>
        {ChangelogFooter}
    </Root>;
}