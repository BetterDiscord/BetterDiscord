import {React, Utilities} from "modules";

export default class TabBar extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this.listRef = React.createRef();
        this.state = {
            selected: this.props.items.find(item => item.value === this.props.value)
        };
    }

    // getDeriveredStateFromProps(props, state) {
    //     if (props.value !== state.selected) {
    //         return {selected: props.value};
    //     }
    //     return null;
    // }

    onChange(item) {
        this.setState({selected: item});
        if (typeof(this.props.onChange) === "function") this.props.onChange(item.value);
    }

    onKeyDown(event) {
        const children = this.listRef.current.children;
        const keyMap = {
            ArrowRight: Array.from(children).indexOf(event.currentTarget) + 1,
            ArrowLeft: Array.from(children).indexOf(event.currentTarget) - 1,
            Home: 0,
            End: children.length - 1
        };

        if (keyMap.hasOwnProperty(event.key)) {
            event.preventDefault();
            children[keyMap[event.key]]?.focus();
        }
    }

    render() {
        const {selected} = this.state;

        return <ul role="tablist" className="bd-tab-bar" aria-orientation="horizontal" ref={this.listRef}>
            {this.props.items.map(item => (
                <button
                    role="tab"
                    key={item.value}
                    tabIndex={((item.value === selected.value) && !item.disabled) ? "0" : "-1"}
                    className={Utilities.className("bd-tab-item", {selected: item.value === selected.value}, {disabled: item.disabled})}
                    onClick={() => this.onChange(item)}
                    onKeyDown={this.onKeyDown}
                    aria-disabled={item.disabled}
                    aria-selected={item.value === selected.value}
                >
                    {item.name}
                </button>
            ))}
            {this.props.children}
        </ul>;
    }
}