import {React} from "modules";

export default class Switch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {checked: this.props.checked};
        this.onChange = this.onChange.bind(this);
    }

    onChange() {
        if (this.props.disabled) return;
        this.props.onChange(!this.state.checked);
        this.setState({checked: !this.state.checked});
    }

    render() {
        const enabledClass = this.props.disabled ? " bd-switch-disabled" : "";
        const checkedClass = this.state.checked ? " bd-switch-checked" : "";
        return <div className={`bd-switch` + enabledClass + checkedClass}>
                    <input type="checkbox" id={this.props.id} className={`bd-checkbox`} disabled={this.props.disabled} checked={this.state.checked} onChange={this.onChange} />
                </div>;
    }
}