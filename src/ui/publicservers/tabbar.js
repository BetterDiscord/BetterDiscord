import {React} from "modules";

class TabBarItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.selected || false
        };
        this.onClick = this.onClick.bind(this);
    }

    render() {
        return React.createElement(
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

class TabBarSeparator extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement("div", {className: "ui-tab-bar-separator margin-top-8 margin-bottom-8"});
    }
}

class TabBarHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement(
            "div",
            {className: "ui-tab-bar-header"},
            this.props.text
        );
    }
}

export default class TabBar {
    static get Item() {
        return TabBarItem;
    }
    static get Header() {
        return TabBarHeader;
    }
    static get Separator() {
        return TabBarSeparator;
    }
}