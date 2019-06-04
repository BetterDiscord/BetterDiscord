import {React} from "modules";

const className = "bd-settings-title h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh2-2LTaUL marginBottom20-32qID7";

export default class SettingsTitle extends React.Component {
    constructor(props) {
        super(props);
    }
//h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi da-h2 da-title da-size16 da-height20 da-weightSemiBold defaultColor-1_ajX0 da-defaultColor marginTop60-3PGbtK da-marginTop60 marginBottom20-32qID7 da-marginBottom20
    render() {
        const titleClass = this.props.className ? `${className} ${this.props.className}` : className;
        return <h2 className={titleClass} onClick={() => {this.props.onClick && this.props.onClick();}}>
                {this.props.text}
                {this.props.button && <button className="bd-title-button" onClick={this.props.button.onClick}>{this.props.button.title}</button>}
                </h2>;
    }
}