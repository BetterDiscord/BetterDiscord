import {React, WebpackModules} from "modules";
const {ScrollerAuto: Scroller} = WebpackModules.getByProps("ScrollerAuto");
export default class EmoteMenuCard extends React.Component {
    render() {
        return <div className={`bd-emote-menu`}>
            <Scroller className="bd-emote-scroller">
                <div className="bd-emote-menu-inner">
                    {this.props.children}
                </div>
            </Scroller>
        </div>;
    }
}