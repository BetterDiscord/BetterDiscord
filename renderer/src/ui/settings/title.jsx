import {React} from "modules";

const className = "bd-settings-title";
const className2 = "bd-settings-title bd-settings-group-title";

export default class SettingsTitle extends React.Component {
    constructor(props) {
        super(props);
        this.buttonClick = this.buttonClick.bind(this);
    }

    buttonClick(event) {
        event.stopPropagation();
        event.preventDefault();
        this.props?.button?.onClick?.(event);
    }

    render() {
        const baseClass = this.props.isGroup ? className2 : className;
        const titleClass = this.props.className ? `${baseClass} ${this.props.className}` : baseClass;
        return <h2 className={titleClass} onClick={() => {this.props.onClick && this.props.onClick();}}>
                {this.props.text}
                {this.props.button && <button className="bd-button bd-button-title" onClick={this.buttonClick}>{this.props.button.title}</button>}
                {this.props.otherChildren}
                </h2>;
    }
}