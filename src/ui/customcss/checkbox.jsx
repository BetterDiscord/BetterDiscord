import {React} from "modules";

export default class Checkbox extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = {checked: this.props.checked || false};
    }

    render() {
        return <div className="checkbox-item">
            <div className="checkbox-label label-JWQiNe da-label">{this.props.text}</div>
            <div className="checkbox-wrapper checkbox-3kaeSU da-checkbox checkbox-3EVISJ da-checkbox" onClick={this.onClick}>
                <div className="checkbox-inner checkboxInner-3yjcPe da-checkboxInner">
                    <input className="checkbox checkboxElement-1qV33p da-checkboxElement" checked={this.state.checked} type="checkbox" />
                    <span></span>
                </div>
                <span></span>
            </div>
        </div>;
    }

    onClick() {
        this.props.onChange(!this.state.checked);
        this.setState({checked: !this.state.checked});
    }
}