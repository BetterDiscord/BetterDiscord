import BDV2 from "../modules/v2";

// import SettingsTitle from "./settingsTitle";
import SettingsGroup from "./settingsGroup";

export default class V2C_SectionedSettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            // BDV2.react.createElement("div", {className: "ui-flex ui-section-panel-title"},
            //     BDV2.react.createElement(SettingsTitle, {text: this.props.title}),
            //     this.props.button && BDV2.react.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: this.props.button.onClick}, this.props.button.title)
            // ),
            this.props.sections.map(section => {
                return BDV2.react.createElement(SettingsGroup, Object.assign({}, section, {onChange: this.props.onChange}));
            })
        );
    }
}