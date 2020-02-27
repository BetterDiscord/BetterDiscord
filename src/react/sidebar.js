import BDV2 from "../v2";

import TabBarSeparator from "./tabBarSeparator";
import TabBarHeader from "./tabBarHeader";
import TabBarItem from "./tabBarItem";

export default class V2C_SideBar extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        const self = this;
        const si = $("[class*=side-] > [class*=selected]");
        if (si.length) self.scn = si.attr("class");
        const ns = $("[class*=side-] > [class*='item-']:not([class*=selected])");
        if (ns.length) self.nscn = ns.attr("class");
        $("[class*='side-'] > [class*='item-']").on("click", () => {
            self.setState({
                selected: null
            });
        });
        self.setInitialState();
        self.onClick = self.onClick.bind(self);
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
            BDV2.react.createElement(TabBarHeader, {text: headerText}),
            items.map(item => {
                const {id, text} = item;
                return BDV2.react.createElement(TabBarItem, {key: id, selected: selected === id, text: text, id: id, onClick: self.onClick});
            })
        );
    }

    onClick(id) {
        const self = this;
        const si = $("[class*=side] > [class*=selected]");
        if (si.length) {
            si.off("click.bdsb").on("click.bsb", e => {
                $(e.target).attr("class", self.scn);
            });
            si.attr("class", self.nscn);
        }

        self.setState({selected: null});
        self.setState({selected: id});

        if (self.props.onClick) self.props.onClick(id);
    }
}