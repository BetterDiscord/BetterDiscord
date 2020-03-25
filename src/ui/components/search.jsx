import BDV2 from "../../modules/v2";
import SearchIcon from "../icons/search";

const React = BDV2.React;

export default class Search extends React.Component {
    render() {
        return <div className="bd-search-wrapper">
                    <input onChange={this.props.onChange} onKeyDown={this.props.onKeyDown} type="text" className="bd-search" placeholder={this.props.placeholder} maxLength="50" />
                    <SearchIcon />
                </div>;
    }
}