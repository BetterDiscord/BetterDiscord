import {React} from "modules";

import Keyboard from "../../icons/keyboard";
import Close from "../../icons/close";

export default class Keybind extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.value, isRecording: false};
        this.onClick = this.onClick.bind(this);
        this.keyHandler = this.keyHandler.bind(this);
        this.clearKeybind = this.clearKeybind.bind(this);
        this.accum = [];
        this.max = this.props.max ?? 2;
    }

    componentDidMount() {
        window.addEventListener("keydown", this.keyHandler);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.keyHandler);
    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    keyHandler(event) {
        if (!this.state.isRecording) return;
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        if (event.repeat || this.accum.includes(event.key)) return;

        this.accum.push(event.key);
        if (this.accum.length == this.max) {
            if (this.props.onChange) this.props.onChange(this.accum);
            this.setState({value: this.accum.slice(0), isRecording: false}, () => this.accum.splice(0, this.accum.length));
        }
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    onClick(e) {
        if (e.target?.className?.includes?.("bd-keybind-clear") || e.target?.closest(".bd-button")?.className?.includes("bd-keybind-clear")) return this.clearKeybind(e);
        this.setState({isRecording: !this.state.isRecording});
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    clearKeybind(event) {
        event.stopPropagation();
        event.preventDefault();
        this.accum.splice(0, this.accum.length);
        if (this.props.onChange) this.props.onChange(this.accum);
        this.setState({value: this.accum, isRecording: false});
    }

    display() {
        if (this.state.isRecording) return "Recording...";
        if (!this.state.value.length) return "N/A";
        return this.state.value.join(" + ");
    }

    render() {
        const {clearable = true} = this.props;
        return <div className={"bd-keybind-wrap" + (this.state.isRecording ? " recording" : "")} onClick={this.onClick}>
                <input readOnly={true} type="text" className="bd-keybind-input" value={this.display()} />
                <div className="bd-keybind-controls">
                    <button className={"bd-button bd-keybind-record" + (this.state.isRecording ? " bd-button-danger" : "")}><Keyboard size="24px" /></button>
                    {clearable && <button onClick={this.clearKeybind} className="bd-button bd-keybind-clear"><Close size="24px" /></button>}
                </div>
            </div>;
    }
}