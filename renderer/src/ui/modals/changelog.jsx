import {React, DiscordModules, WebpackModules} from "modules";
import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Flex from "../base/flex";
import Text from "../base/text";
import CloseButton from "./close";

import SimpleMarkdownExt from "../../structs/markdown";

const {useMemo} = React;


const AnchorClasses = WebpackModules.getByProps("anchorUnderlineOnHover") || {anchor: "anchor-3Z-8Bb", anchorUnderlineOnHover: "anchorUnderlineOnHover-2ESHQB"};
const joinSupportServer = (click) => {
    click.preventDefault();
    click.stopPropagation();
    DiscordModules.InviteActions.acceptInviteAndTransitionToInviteChannel({inviteKey: "0Tmfo5ZbORCRqbAd"});
};

const supportLink = <a className={`${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`} onClick={joinSupportServer}>Join our Discord Server.</a>;
const defaultFooter = <Text>Need support? {supportLink}</Text>;


export default function ChangelogModal({transitionState, footer, title, subtitle, onClose, video, poster, image, description, changes}) {

    const ChangelogHeader = useMemo(() => <Header justify={Flex.Justify.BETWEEN}>
        <Flex direction={Flex.Direction.VERTICAL}>
            <Text tag="h1" size={Text.Sizes.SIZE_20} strong={true}>{title}</Text>
            <Text size={Text.Sizes.SIZE_12} color={Text.Colors.HEADER_SECONDARY}>{subtitle}</Text>
        </Flex>
        <CloseButton onClick={onClose} />
    </Header>, [title, subtitle, onClose]);

    const ChangelogFooter = useMemo(() => <Footer>
        <Flex.Child grow="1" shrink="1">
            {footer ? footer : defaultFooter}
        </Flex.Child>
    </Footer>, [footer]);

    const changelogItems = useMemo(() => {
        const items = [video ? <video src={video} poster={poster} controls={true} className="bd-changelog-poster" /> : <img src={image} className="bd-changelog-poster" />];
        if (description) items.push(<p>{SimpleMarkdownExt.parseToReact(description)}</p>);
        for (let c = 0; c < changes.length; c++) {
            const entry = changes[c];
            const type = "bd-changelog-" + entry.type;
            const margin = c == 0 ? " bd-changelog-first" : "";
            items.push(<h1 className={`bd-changelog-title ${type}${margin}`}>entry.title</h1>);
            if (entry.description) items.push(<p>{SimpleMarkdownExt.parseToReact(entry.description)}</p>);
            const list = <ul>{entry.items.map(i => <li>{SimpleMarkdownExt.parseToReact(i)}</li>)}</ul>;
            items.push(list);
        }
        return items;
    }, [description, video, image, poster, changes]);

    return <Root className="bd-changelog-modal" transitionState={transitionState} size={Root.Sizes.SMALL} style={Root.Styles.STANDARD}>
        {ChangelogHeader}
        <Content>{changelogItems}</Content>
        {ChangelogFooter}
    </Root>;
}