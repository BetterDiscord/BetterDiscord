import {React} from "modules";

export default class Slider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.value};
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.setState({value: e.target.value});
        // e.target.style.backgroundSize = (e.target.value - this.props.min) * 100 / (this.props.max - this.props.min) + "% 100%";
        if (this.props.onChange) this.props.onChange(e.target.value);
    }

    render() {
        return <div className="bd-slider-wrap">
            <div className="bd-slider-label">{this.state.value}</div><input onChange={this.onChange} type="range" className="bd-slider-input" min={this.props.min} max={this.props.max} step={this.props.step} value={this.state.value} style={{backgroundSize: (this.state.value - this.props.min) * 100 / (this.props.max - this.props.min) + "% 100%"}} />
        </div>;
    }
}