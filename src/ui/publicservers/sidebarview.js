import {React} from "modules";
import Scroller from "./scroller";

export default class SidebarView extends React.Component {

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
                React.createElement(Scroller, {key: "sidebarScroller", sidebar: true, fade: sidebar.fade || true, dark: sidebar.dark || true}, sidebar.component)
            ),
            React.createElement("div", {className: "contentRegion-3nDuYy content-region"},
                React.createElement("div", {className: "contentTransitionWrap-3hqOEW content-transition-wrap"},
                    React.createElement(Scroller, {key: "contentScroller", contentColumn: true, fade: content.fade || true, dark: content.dark || true}, content.component, tools.component)
                )
            )
        );
    }
}