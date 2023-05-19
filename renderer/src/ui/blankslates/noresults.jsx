import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";

import MagnifyingGlass from "@ui/icons/magnifyingglass";


export default function NoResults(props) {
    return <div className={"bd-empty-results" + (props.className ? ` ${props.className}` : "")}>
                <MagnifyingGlass />
                <div className="bd-empty-results-text">
                    {props.text || DiscordModules.Strings.SEARCH_NO_RESULTS || ""}
                </div>
            </div>;
}