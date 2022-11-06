import {React} from "modules";

import Checkmark from "../icons/check";

export default class Checkbox extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = {checked: this.props.checked || false};
    }

    render() {
        return <div className="checkbox-item">
            <div className="checkbox-label">{this.props.text}</div>
            <div className={"checkbox-wrapper" + (this.state.checked ? " checked" : "")} onClick={this.onClick}>
                <input className="checkbox" checked={this.state.checked} type="checkbox" />
                <Checkmark size="18px" />
            </div>
        </div>;
    }

    onClick() {
        this.props.onChange(!this.state.checked);
        this.setState({checked: !this.state.checked});
    }
}