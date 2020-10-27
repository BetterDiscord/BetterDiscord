import {React} from "modules";
import SearchIcon from "../../icons/search";

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.value};
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.setState({value: e.target.value});
        if (this.props.onChange) this.props.onChange(e);
    }

    render() {
        return <div className={"bd-search-wrapper" + (this.props.className ? ` ${this.props.className}` : "")}>
                    <input onChange={this.onChange} onKeyDown={this.props.onKeyDown} type="text" className="bd-search" placeholder={this.props.placeholder} maxLength="50" value={this.state.value} />
                    <SearchIcon />
                </div>;
    }
}