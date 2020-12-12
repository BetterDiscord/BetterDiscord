import {React} from "modules";
import DownArrow from "../../ui/icons/downarrow";

export default class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: true
        };
    }
    render() {
        return <div className="bd-emote-category">
            <div className={`bd-emote-header ${this.state.expanded ? "expanded" : "collapsed"}`}>
                <div className="bd-emote-header-inner" onClick={() => this.setState({expanded: !this.state.expanded})}>
                    <div className="bd-emote-header-icon">
                        {this.props.icon ? this.props.icon : null}
                    </div>
                    <div className="bd-emote-header-label">{this.props.label}</div>
                    <div className={`bd-emote-collapse-icon ${this.state.expanded ? "expanded" : "collapsed"}`}>
                        <DownArrow/>
                    </div>
                </div>
            </div>
            {this.state.expanded && this.props.children}
        </div>;
    }
}