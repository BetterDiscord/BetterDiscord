import BDV2 from "../../modules/v2";
import Arrow from "../icons/downarrow";

const React = BDV2.React;


export default class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: false, value: this.props.value || this.props.options[0].value};
        this.dropdown = React.createRef();
        this.onChange = this.onChange.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
    }

    showMenu(event) {
        event.preventDefault();
        this.setState({open: true}, () => {
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
        return  <div className={`bd-select${style}${isOpen}`} onClick={this.showMenu} ref={this.dropdown}>
                    <div className="bd-select-value">{this.selected.label}</div>
                    <Arrow className="bd-select-arrow" />
                    {this.state.open && this.options}
                </div>;
    }
}

// return <div className="bd-select-wrap">
// <label className="bd-label">{this.props.label}</label>
// <div className={`bd-select${style}${isOpen}`} onClick={this.showMenu} ref={this.dropdown}>
//     <div className="bd-select-controls">
//         <div className="bd-select-value">{this.selected.label}</div>
//         <Arrow className="bd-select-arrow" />
//     </div>
// </div>
// {this.state.open && this.options}
// </div>;