import BDV2 from "../modules/v2";

import TabBarSeparator from "./tabBarSeparator";
import TabBarHeader from "./tabBarHeader";
import TabBarItem from "./tabBarItem";

export default class V2C_SideBar extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        const si = document.querySelector("[class*=side-] > [class*=selected]");
        if (si) this.scn = si.className;
        const ns = document.querySelector("[class*=side-] > [class*='item-']:not([class*=selected])");
        if (ns) this.nscn = ns.className;
        const tabs = document.querySelectorAll("[class*='side-'] > [class*='item-']");
        for (const element of tabs) {
            element.addEventListener("click", () => {
                this.setState({
                    selected: null
                });
            });
        }
        
        this.setInitialState();
        this.onClick = this.onClick.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }

    setInitialState() {
        const self = this;
        self.state = {
            selected: null,
            items: self.props.items
        };

        const initialSelection = self.props.items.find(item => {
            return item.selected;
        });
        if (initialSelection) {
            self.state.selected = initialSelection.id;
        }
    }

    render() {
        const self = this;
        const {headerText} = self.props;
        const {items, selected} = self.state;
        return BDV2.react.createElement(
            "div",
            null,
            BDV2.react.createElement(TabBarSeparator, null),
            BDV2.react.createElement(TabBarHeader, {text: headerText, button: this.props.headerButton}),
            items.map(item => {
                const {id, text} = item;
                return BDV2.react.createElement(TabBarItem, {key: id, selected: selected === id, text: text, id: id, onClick: self.onClick});
            })
        );
    }

    setSelected(e) {
        e.target.className = this.scn;
    }

    onClick(id) {
        const si = document.querySelector("[class*=side] > [class*=selected]");
        if (si) {
            si.removeEventListener("click", this.setSelected);
            si.addEventListener("click", this.setSelected);
            si.className = this.nscn;
        }

        this.setState({selected: null});
        this.setState({selected: id});

        if (this.props.onClick) this.props.onClick(id);
    }
}