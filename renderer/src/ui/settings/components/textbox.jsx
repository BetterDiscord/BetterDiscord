import {React} from "modules";

export default class Textbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.value};
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.setState({value: e.target.value});
        if (this.props.onChange) this.props.onChange(e.target.value);
    }

    render() {
        return <input onChange={this.onChange} onKeyDown={this.props.onKeyDown} type="text" className="bd-text-input" placeholder={this.props.placeholder} maxLength={this.props.maxLength} value={this.state.value} />;
    }
}