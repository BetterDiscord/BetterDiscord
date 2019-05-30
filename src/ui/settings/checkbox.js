import {React} from "modules";

export default class V2C_Checkbox extends React.Component {
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
        return React.createElement(
            "li",
            null,
            React.createElement(
                "div",
                {className: "checkbox checkbox-3kaeSU da-checkbox checkbox-3EVISJ da-checkbox", onClick: this.onClick},
                React.createElement(
                    "div",
                    {className: "checkbox-inner checkboxInner-3yjcPe da-checkboxInner"},
                    React.createElement("input", {className: "checkboxElement-1qV33p da-checkboxElement", checked: this.state.checked, onChange: () => {}, type: "checkbox"}),
                    React.createElement("span", null)
                ),
                React.createElement(
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