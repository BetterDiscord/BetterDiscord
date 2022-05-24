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

        this.state = {
            hasContent: !!props.value,
            value: props.value || ""
        };
    }

    static get Sizes() {return Sizes;}

    static get defaultProps() {
        return {
            size: Sizes.SMALL,
            disabled: false
        };
    }

    onChange = ({target: {value}}) => {
        this.setState({value, hasContent: !!value});
        if (typeof(this.props.onChange) === "function") this.props.onChange(value);
    }

    render() {
        const {className, size = Sizes.SMALL, placeholder, disabled = false} = this.props;

        return <div className={Utilities.joinClassNames("bd-searchbar", className, {disabled}, Sizes[size.toUpperCase()] ?? "SMALL")}>
            <input onKeyDown={this.props.onKeyDown} onChange={this.onChange} disabled={disabled} type="text" placeholder={placeholder} maxLength="50" value={this.state.value} />
            <div onClick={() => this.onChange({target: {value: ""}})} className={Utilities.joinClassNames("bd-search-icon", {clickable: this.state.hasContent})} tabIndex="-1" role="button">
                <Close className={Utilities.joinClassNames("bd-search-close", {visible: this.state.hasContent})}/>
                <Search className={Utilities.joinClassNames({visible: !this.state.hasContent})} />
            </div>
        </div>;
    }
}