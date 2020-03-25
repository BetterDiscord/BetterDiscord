import BDV2 from "../modules/v2";

export default class V2C_TabBarItem extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onClick = this.onClick.bind(this);
    }

    setInitialState() {
        this.state = {
            selected: this.props.selected || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: `ui-tab-bar-item${this.props.selected ? " selected" : ""}`, onClick: this.onClick},
            this.props.text
        );
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.id);
        }
    }
}