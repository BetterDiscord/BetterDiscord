import {React, WebpackModules} from "modules";
const Scroller = WebpackModules.getByDisplayName("VerticalScroller");
export default class EmoteMenuCard extends React.Component {
    render() {
        React.createElement("div", {
            className: "bd-qem-twitch-container",
            children: React.createElement(Scroller, {
                children: React.createElement("div", {
                    className: "emote-menu-inner",
                    children: ""
                })
            })
        })
        return <div className={`bd-qem-${this.props.type}-container`}>
            <Scroller style={{height: "400px"}}>
                <div className="emote-menu-inner">
                    {this.props.children}
                </div>
            </Scroller>
        </div>
    }
}