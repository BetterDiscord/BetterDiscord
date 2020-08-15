import BDV2 from "../modules/v2";

export default class V2C_Scroller extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        //scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y
        let wrapperClass = `scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d${this.props.fade ? " scrollerFade-1Ijw5y" : ""}`;
        let scrollerClass = "scroller-2FKFPG scroller";                                          /* fuck */
        if (this.props.sidebar) scrollerClass = "sidebarRegionScroller-3MXcoP thin-1ybCId scrollerBase-289Jih fade-2kXiP2 sidebar-region-scroller scroller";
        if (this.props.contentColumn) {
            scrollerClass = "contentRegionScroller-26nc1e auto-Ge5KZx scrollerBase-289Jih content-region-scroller scroller";                                         /* fuck */
            wrapperClass = "contentTransitionWrap-3hqOEW";
        }
        const {children} = this.props;
        if (this.props.sidebar) {
            return BDV2.react.createElement(
                    "div",
                    {key: "scroller", ref: "scroller", className: scrollerClass},
                    children
                );
        }
        return BDV2.react.createElement(
            "div",
            {key: "scrollerwrap", className: wrapperClass},
            BDV2.react.createElement(
                "div",
                {key: "scroller", ref: "scroller", className: scrollerClass},
                children
            )
        );
    }
}

const originalRender = V2C_Scroller.prototype.render;
Object.defineProperty(V2C_Scroller.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {console.warn("Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});