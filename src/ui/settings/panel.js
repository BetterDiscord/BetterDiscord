import {SettingsCookie} from "data";
import {React} from "modules";
import SettingsTitle from "./title";
import Switch from "./switch";

export default class V2C_SettingsPanel extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {settings} = this.props;
        return React.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            React.createElement(SettingsTitle, {text: this.props.title}),
            this.props.button && React.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: this.props.button.onClick}, this.props.button.title),
            settings.map(setting => {
                return React.createElement(Switch, {id: setting.id, key: setting.id, data: setting, checked: SettingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    }});
            })
        );
    }
}