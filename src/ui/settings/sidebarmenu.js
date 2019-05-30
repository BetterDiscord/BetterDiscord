import {React} from "modules";
import TabBar from "./tabbar";

export default class V2C_SideBar extends React.Component {

    constructor(props) {
        super(props);
        const self = this;
        const si = $("[class*=side] > [class*=selected]");
        if (si.length) self.scn = si.attr("class");
        const ns = $("[class*=side] > [class*=notSelected]");
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
        return React.createElement(
            "div",
            null,
            React.createElement(TabBar.Separator, null),
            React.createElement(TabBar.Header, {text: headerText}),
            items.map(item => {
                const {id, text} = item;
                return React.createElement(TabBar.Item, {key: id, selected: selected === id, text: text, id: id, onClick: self.onClick});
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