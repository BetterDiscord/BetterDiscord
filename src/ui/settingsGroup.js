import {settingsCookie} from "../0globals";
import BDV2 from "../modules/v2";

import SettingsTitle from "./settingsTitle";
import Switch from "./switch";

export default class V2C_SettingsGroup extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        const {title, settings, button} = this.props;
        const buttonComponent = button ? BDV2.react.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: button.onClick}, button.title) : null;
        return [BDV2.react.createElement(SettingsTitle, {text: title}),
                buttonComponent,
                settings.map(setting => {
                    return BDV2.react.createElement(Switch, {id: setting.id, key: setting.id, data: setting, checked: settingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    }});
                })];
    }
}