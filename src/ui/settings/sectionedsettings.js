import {React} from "modules";
import SettingsGroup from "./settingsgroup";

export default class V2C_SectionedSettingsPanel extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement(
            "div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            this.props.sections.map(section => {
                return React.createElement(SettingsGroup, Object.assign({}, section, this.props.onChange));
            })
        );
    }
}