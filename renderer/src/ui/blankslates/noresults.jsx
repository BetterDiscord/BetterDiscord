import {React, DiscordModules} from "modules";
import MagnifyingGlass from "../icons/magnifyingglass";

export default function NoResults(props) {
    return <div className={"bd-empty-results" + (props.className ? ` ${props.className}` : "")}>
                <MagnifyingGlass />
                <div className="bd-empty-results-text">
                    {props.text || DiscordModules.Strings.SEARCH_NO_RESULTS || ""}
                </div>
            </div>;
}