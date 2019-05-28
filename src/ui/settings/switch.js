export default class V2C_Switch extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: this.props.checked
        };
    }

    render() {
        let {text, info} = this.props.data;
        let {checked} = this.state;
        return BDV2.react.createElement(
            "div",
            {className: "ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item"},
            BDV2.react.createElement(
                "div",
                {className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap"},
                BDV2.react.createElement(
                    "h3",
                    {className: "ui-form-title h3 margin-reset margin-reset ui-flex-child"},
                    text
                ),
                BDV2.react.createElement(
                    "label",
                    {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                    BDV2.react.createElement("input", {className: "ui-switch-checkbox", type: "checkbox", checked: checked, onChange: e => this.onChange(e)}),
                    BDV2.react.createElement("div", {className: `ui-switch ${checked ? "checked" : ""}`})
                )
            ),
            BDV2.react.createElement(
                "div",
                {className: "ui-form-text style-description margin-top-4", style: {flex: "1 1 auto"}},
                info
            )
        );
    }

    onChange() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            checked: !this.state.checked
        });
    }
}