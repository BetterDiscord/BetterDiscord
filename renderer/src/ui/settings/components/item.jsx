import {React} from "modules";

export default class SettingItem extends React.Component {
    render() {
        return <div className={"bd-setting-item" + (this.props.inline ? " inline" : "")}>
                    <div className={"bd-setting-header"}>
                        <label htmlFor={this.props.id} className={"bd-setting-title"}>{this.props.name}</label>
                        {this.props.inline && this.props.children}
                    </div>
                    <div className={"bd-setting-note"}>{this.props.note}</div>
                    {!this.props.inline && this.props.children}
                    <div className={"bd-setting-divider"} />
                </div>;
    }
}