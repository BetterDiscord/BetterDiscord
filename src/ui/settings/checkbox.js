export default class V2C_Checkbox extends BDV2.reactComponent {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.setInitialState();
    }

    setInitialState() {
        this.state = {
            checked: this.props.checked || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "li",
            null,
            BDV2.react.createElement(
                "div",
                {className: "checkbox", onClick: this.onClick},
                BDV2.react.createElement(
                    "div",
                    {className: "checkbox-inner"},
                    BDV2.react.createElement("input", {checked: this.state.checked, onChange: () => {}, type: "checkbox"}),
                    BDV2.react.createElement("span", null)
                ),
                BDV2.react.createElement(
                    "span",
                    null,
                    this.props.text
                )
            )
        );
    }

    onClick() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            checked: !this.state.checked
        });
    }
}