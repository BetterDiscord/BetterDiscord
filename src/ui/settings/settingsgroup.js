import {SettingsCookie} from "data";
import {React} from "modules";
import SettingsTitle from "./title";
import Switch from "./switch";

export default class V2C_SettingsGroup extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {title, settings, button} = this.props;
        const buttonComponent = button ? React.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: button.onClick}, button.title) : null;
        return [React.createElement(SettingsTitle, {text: title}),
                buttonComponent,
                settings.map(setting => {
                    return React.createElement(Switch, {id: setting.id, key: setting.id, data: setting, checked: SettingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    }});
                })];
    }
}