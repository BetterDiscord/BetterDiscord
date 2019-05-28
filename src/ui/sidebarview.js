export default class V2C_SidebarView extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let {sidebar, content, tools} = this.props.children;
        return BDV2.react.createElement(
            "div",
            {className: "standardSidebarView-3F1I7i ui-standard-sidebar-view"},
            BDV2.react.createElement(
                "div",
                {className: "sidebarRegion-VFTUkN sidebar-region"},
                BDV2.react.createElement(V2Components.Scroller, {key: "sidebarScroller", ref: "sidebarScroller", sidebar: true, fade: sidebar.fade || true, dark: sidebar.dark || true, children: sidebar.component})
            ),
            BDV2.react.createElement("div", {className: "contentRegion-3nDuYy content-region"},
                BDV2.react.createElement("div", {className: "contentTransitionWrap-3hqOEW content-transition-wrap"},
                    BDV2.react.createElement("div", {className: "scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix contentRegionScrollerWrap-3YZXdm content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv"},
                        BDV2.react.createElement("div", {className: "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix contentRegionScroller-26nc1e content-region-scroller scroller", ref: "contentScroller"},
                            BDV2.react.createElement("div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"}, content.component),
                            tools.component
                        )
                    )
                )
            )
        );
    }
}