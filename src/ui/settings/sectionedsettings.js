export default class V2C_SectionedSettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            this.props.sections.map(section => {
                return BDV2.react.createElement(V2Components.SettingsGroup, Object.assign({}, section, this.props.onChange));
            })
        );
    }
}