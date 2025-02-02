import clsx from "clsx";
import React from "@modules/react";

import MagnifyingGlass from "@ui/icons/magnifyingglass";
import Strings from "@modules/strings";


export default function NoResults(props) {
    return <div className={clsx("bd-empty-results", props.className)}>
                {props.image ? props.image : <MagnifyingGlass />}
                <div className="bd-empty-results-text">
                    {props.text || Strings.Addons.results.format({count: 0}) || ""}
                </div>
                {props.children}
            </div>;
}