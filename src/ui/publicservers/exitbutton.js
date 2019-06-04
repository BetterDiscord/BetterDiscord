import {React} from "modules";
import CloseButton from "../icons/close";

export default class V2C_Tools extends React.Component {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    render() {
        return React.createElement("div", {className: "tools-container toolsContainer-1edPuj"},
            React.createElement("div", {className: "tools tools-3-3s-N"},
                React.createElement("div", {className: "container-1sFeqf"},
                    React.createElement("div",
                        {className: "btn-close closeButton-1tv5uR", onClick: this.onClick},
                        React.createElement(CloseButton, null)
                    ),
                    React.createElement(
                        "div",
                        {className: "esc-text keybind-KpFkfr"},
                        "ESC"
                    )
                )
            )
        );
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
        $(".closeButton-1tv5uR").first().click();
    }
}