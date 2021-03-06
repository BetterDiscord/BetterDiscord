import {React} from "modules";

const className = "bd-settings-title h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh2-2LTaUL marginBottom20-32qID7";
const className2 = "bd-settings-title bd-settings-group-title h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi da-h5 da-title da-size12 da-height16 da-weightSemiBold marginBottom4-2qk4Hy da-marginBottom4 marginTop8-1DLZ1n da-marginTop8";

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