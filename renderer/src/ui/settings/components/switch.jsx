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
            <input id={this.props.id} type="checkbox" disabled={this.props.disabled} checked={this.state.checked} onChange={this.onChange} />
            <div className="bd-switch-body">
                <svg className="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet">
                <rect className="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                    <svg className="bd-switch-symbol" viewBox="0 0 20 20" fill="none">
                        <path></path>
                        <path></path>
                    </svg>
                </svg>
            </div>
        </div>;
    }
}