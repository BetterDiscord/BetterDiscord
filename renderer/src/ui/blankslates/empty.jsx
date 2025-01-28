import clsx from "clsx";
import SimpleMarkdown from "@structs/markdown";

import React from "@modules/react";
import EmptyImage from "./emptyimage";
import Strings from "@modules/strings";


export default function Empty(props) {
    return <div className={clsx("bd-empty-image-container", props.className)}>
                <EmptyImage />
                <div className="bd-empty-image-title">
                    {props.title || Strings.Addons.blankSlateHeaderGeneric}
                </div>
                <div className="bd-empty-image-message">
                    {SimpleMarkdown.parseToReact(props.message || Strings.Addons.blankSlateMessageGeneric)}
                </div>
                {props.children}
            </div>;
}