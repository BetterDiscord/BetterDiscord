import {React} from "modules";

export default class Number extends React.Component {
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
        return <input onChange={this.onChange} type="number" className="bd-number-input" min={this.props.min} max={this.props.max} step={this.props.step} value={this.state.value} />;
    }
}