import BDV2 from "../modules/v2";

import XSvg from "./xSvg";

export default class V2C_Tools extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    render() {
        return BDV2.react.createElement("div", {className: "tools-container toolsContainer-1edPuj"},
            BDV2.react.createElement("div", {className: "tools tools-3-3s-N"},
                BDV2.react.createElement("div", {className: "container-1sFeqf"},
                    BDV2.react.createElement("div",
                        {className: "btn-close closeButton-1tv5uR", onClick: this.onClick},
                        BDV2.react.createElement(XSvg, null)
                    ),
                    BDV2.react.createElement(
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
        const closeButton = document.querySelector(".closeButton-1tv5uR");
        if (closeButton) closeButton.click();
    }
}