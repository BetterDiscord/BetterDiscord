import SimpleMarkdown from "@structs/markdown";

import React from "@modules/react";
import WebpackModules from "@modules/webpackmodules";


const EmptyImageClasses = WebpackModules.getByProps("emptyImage", "emptyHeader") ?? {emptyContainer: "emptyContainer-poti7J", emptyImage: "emptyImage-2pCD2j", emptyHeader: "emptyHeader-2cxTFP"};

export default function EmptyImage(props) {
    return <div className={`bd-empty-image-container ${EmptyImageClasses.emptyContainer}` + (props.className ? ` ${props.className}` : "")}>
                <div className={`bd-empty-image ${EmptyImageClasses.emptyImage}`}></div>
                <div className={`bd-empty-image-header ${EmptyImageClasses.emptyHeader}`}>
                    {props.title || "You don't have anything!"}
                </div>
                <div className={`bd-empty-image-message`}>
                    {SimpleMarkdown.parseToReact(props.message || "You should probably get something.")}
                </div>
                {props.children}
            </div>;
}