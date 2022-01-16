import {React} from "modules";

const className = "bd-settings-title";
const className2 = "bd-settings-title bd-settings-group-title";

export default class SettingsTitle extends React.Component {
    render() {
        const baseClass = this.props.isGroup ? className2 : className;
        const titleClass = this.props.className ? `${baseClass} ${this.props.className}` : baseClass;
        return <h2 className={titleClass} onClick={() => {this.props.onClick && this.props.onClick();}}>
                {this.props.text}
                {this.props.button && <button className="bd-button bd-button-title" onClick={this.props.button.onClick}>{this.props.button.title}</button>}
                {this.props.otherChildren}
                </h2>;
    }
}