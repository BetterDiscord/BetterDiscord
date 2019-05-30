import {React} from "modules";
import Scroller from "./scroller";

export default class V2C_SidebarView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {sidebar, content, tools} = this.props.children;
        return React.createElement(
            "div",
            {className: "standardSidebarView-3F1I7i ui-standard-sidebar-view"},
            React.createElement(
                "div",
                {className: "sidebarRegion-VFTUkN sidebar-region"},
                React.createElement(Scroller, {key: "sidebarScroller", ref: "sidebarScroller", sidebar: true, fade: sidebar.fade || true, dark: sidebar.dark || true, children: sidebar.component})
            ),
            React.createElement("div", {className: "contentRegion-3nDuYy content-region"},
                React.createElement("div", {className: "contentTransitionWrap-3hqOEW content-transition-wrap"},
                    React.createElement("div", {className: "scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix contentRegionScrollerWrap-3YZXdm content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv"},
                        React.createElement("div", {className: "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix contentRegionScroller-26nc1e content-region-scroller scroller", ref: "contentScroller"},
                            React.createElement("div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"}, content.component),
                            tools.component
                        )
                    )
                )
            )
        );
    }
}