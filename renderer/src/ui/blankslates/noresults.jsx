import {React, Strings} from "modules";
import MagnifyingGlass from "../icons/magnifyingglass";

export default class NoResults extends React.Component {
    render() {
        return <div className={"bd-empty-results" + (this.props.className ? ` ${this.props.className}` : "")}>
                    <MagnifyingGlass />
                    <div className="bd-empty-results-text">
                        {this.props.text || Strings.Addons.noResults || ""}
                    </div>
                </div>;
    }
}