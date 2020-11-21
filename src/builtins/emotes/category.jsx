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
            <div className={`bd-emote-header ${this.state.opened ? "bd-open" : "bd-closed"}`}>
                <div className="bd-emote-header-inner" onClick={() => this.setState({opened: !this.state.opened})}>
                    <div className="bd-emote-header-icon">
                        {this.props.icon ? this.props.icon : null}
                    </div>
                    <div className="bd-emote-header-label">{this.props.label}</div>
                    <div className={`bd-emote-collapse-icon ${this.state.opened ? "bd-open" : "bd-closed"}`}>
                        <DownArrow/>
                    </div>
                </div>
            </div>
            {this.state.opened && this.props.children}
        </div>;
    }
}