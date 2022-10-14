import {React, Utilities} from "modules";

import Close from "../../icons/close";
import Search from "../../icons/search";

const Sizes = {
    SMALL: "small",
    LARGE: "large",
    MEDIUM: "medium"
};

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.state = {
            hasContent: !!props.value,
            value: props.value || ""
        };
    }

    static get Sizes() {return Sizes;}

    onChange({target: {value}}) {
        this.setState({value, hasContent: !!value});
        if (typeof(this.props.onChange) === "function") this.props.onChange(value);
    }

    render() {
        const {className, size = Sizes.SMALL, placeholder, disabled = false} = this.props;

        return <div className={Utilities.className("bd-searchbar", className, {disabled}, `size-${size}`)}>
            <input onKeyDown={this.props.onKeyDown} onChange={this.onChange} disabled={disabled} type="text" placeholder={placeholder} maxLength="50" value={this.state.value} />
            <div onClick={() => this.onChange({target: {value: ""}})} className={Utilities.className("bd-search-icon", {clickable: this.state.hasContent})} tabIndex="-1" role="button">
                <Close className={Utilities.className("bd-search-close", {visible: this.state.hasContent})}/>
                <Search className={Utilities.className({visible: !this.state.hasContent})} />
            </div>
        </div>;
    }
}