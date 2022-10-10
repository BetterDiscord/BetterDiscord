import {React} from "modules";

import RadioIcon from "../../icons/radio";

export default class Radio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.options.findIndex(o => o.value === this.props.value)};
        this.onChange = this.onChange.bind(this);
        this.renderOption = this.renderOption.bind(this);
    }

    onChange(e) {
        const index = parseInt(e.target.value);
        const newValue = this.props.options[index].value;
        this.setState({value: index});
        if (this.props.onChange) this.props.onChange(newValue);
    }

    renderOption(opt, index) {
        const isSelected = this.state.value === index;
        return <label className={"bd-radio-option" + (isSelected ? " bd-radio-selected" : "")}>
                <input onChange={this.onChange} type="radio" name={this.props.name} checked={isSelected} value={index} />
                {/* <span className="bd-radio-button"></span> */}
                <RadioIcon className="bd-radio-icon" size="24" checked={isSelected} />
                <div className="bd-radio-label-wrap">
                    <div className="bd-radio-label">{opt.name}</div>
                    <div className="bd-radio-description">{opt.desc || opt.description}</div>
                </div>
            </label>;
    }

    render() {
        return <div className="bd-radio-group">
            {this.props.options.map(this.renderOption)}
        </div>;
    }
}

/* <label class="container">
  <input type="radio" name="test" checked="checked">
  <span class="checkmark"></span>
  <div class="test">One<div class="desc">Description</div></div>
</label> */