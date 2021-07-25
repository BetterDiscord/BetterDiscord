import {React} from "modules";
import Arrow from "../../icons/downarrow";

export default class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: false, value: this.props.hasOwnProperty("value") ? this.props.value : this.props.options[0].value};
        this.dropdown = React.createRef();
        this.onChange = this.onChange.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
    }

    showMenu(event) {
        event.preventDefault();
        event.stopPropagation();

        this.setState((state) => ({open: !state.open}), () => {
            if (!this.state.open) return;

            document.addEventListener("click", this.hideMenu);
        });
    }

    hideMenu() {
        this.setState({open: false}, () => {
            document.removeEventListener("click", this.hideMenu);
        });
    }

    onChange(value) {
        this.setState({value});
        if (this.props.onChange) this.props.onChange(value);
    }

    get selected() {return this.props.options.find(o => o.value == this.state.value);}

    get options() {
        const selected = this.selected;
        return <div className="bd-select-options">
            {this.props.options.map(opt =>
                <div className={`bd-select-option${selected.value == opt.value ? " selected" : ""}`} onClick={this.onChange.bind(this, opt.value)}>{opt.label}</div>
            )}
        </div>;
    }

    render() {
        const style = this.props.style == "transparent" ? " bd-select-transparent" : "";
        const isOpen = this.state.open ? " menu-open" : "";
        return <div className={`bd-select${style}${isOpen}`} onClick={this.showMenu} ref={this.dropdown}>
                    <div className="bd-select-value">{this.selected.label}</div>
                    <Arrow className="bd-select-arrow" />
                    {this.state.open && this.options}
                </div>;
    }
}