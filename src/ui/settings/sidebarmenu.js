export default class V2C_SideBar extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
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
        let self = this;
        self.state = {
            selected: null,
            items: self.props.items
        };

        let initialSelection = self.props.items.find(item => {
            return item.selected;
        });
        if (initialSelection) {
            self.state.selected = initialSelection.id;
        }
    }

    render() {
        let self = this;
        let {headerText} = self.props;
        let {items, selected} = self.state;
        return BDV2.react.createElement(
            "div",
            null,
            BDV2.react.createElement(V2Components.TabBar.Separator, null),
            BDV2.react.createElement(V2Components.TabBar.Header, {text: headerText}),
            items.map(item => {
                let {id, text} = item;
                return BDV2.react.createElement(V2Components.TabBar.Item, {key: id, selected: selected === id, text: text, id: id, onClick: self.onClick});
            })
        );
    }

    onClick(id) {
        let self = this;
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