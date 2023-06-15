import SimpleMarkdown from "@structs/markdown";

import React from "@modules/react";
import DiscordClasses from "@modules/discordclasses";


export default function EmptyImage(props) {
    return <div className={`bd-empty-image-container ${DiscordClasses.EmptyImage.emptyContainer}` + (props.className ? ` ${props.className}` : "")}>
                <div className={`bd-empty-image ${DiscordClasses.EmptyImage.emptyImage}`}></div>
                <div className={`bd-empty-image-header ${DiscordClasses.EmptyImage.emptyHeader}`}>
                    {props.title || "You don't have anything!"}
                </div>
                <div className={`bd-empty-image-message`}>
                    {SimpleMarkdown.parseToReact(props.message || "You should probably get something.")}
                </div>
                {props.children}
            </div>;
}