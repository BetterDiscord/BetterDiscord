import {React} from "modules";
import SearchIcon from "../../icons/search";

export default class Search extends React.Component {
    render() {
        return <div className="bd-search-wrapper">
                    <input onChange={this.props.onChange} onKeyDown={this.props.onKeyDown} type="text" className="bd-search" placeholder={this.props.placeholder} maxLength="50" />
                    <SearchIcon />
                </div>;
    }
}