import {React} from "modules";
import DownArrow from "../../ui/icons/downarrow";

export default class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: true
        };
    }
    render() {
        return <div className="bd-emote-category">
            <div className="bd-emote-content">
                <div className="bd-emote-header" onClick={() => this.setState({opened: !this.state.opened})}>
                    <div className="bd-emote-headerIcon">
                        {this.props.icon ? this.props.icon : null}
                    </div>
                    <div className="bd-emote-headerLabel">{this.props.label}</div>
                    <div className="bd-emote-headerCollapseIcon">
                        <DownArrow className={this.state.opened ? "bd-emote-opened" : "bd-emote-closed"}/>
                    </div>
                </div>
            </div>
            {this.state.opened && this.props.children}
        </div>;
    }
}