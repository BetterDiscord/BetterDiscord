import {React, WebpackModules} from "modules";
const Scroller = WebpackModules.getByDisplayName("VerticalScroller");
export default class EmoteMenuCard extends React.Component {
    render() {
        return <div className={`bd-qem-${this.props.type}-container`}>
            <Scroller className="bd-em-scroller">
                <div className="emote-menu-inner">
                    {this.props.children}
                </div>
            </Scroller>
        </div>;
    }
}