import {React, DiscordClasses} from "modules";
import SimpleMarkdown from "../../structs/markdown";

export default class EmptyImage extends React.Component {
    render() {
        return <div className={`bd-empty-image-container ${DiscordClasses.EmptyImage.emptyContainer}` + (this.props.className ? ` ${this.props.className}` : "")}>
                    <div className={`bd-empty-image ${DiscordClasses.EmptyImage.emptyImage}`}></div>
                    <div className={`bd-empty-image-header ${DiscordClasses.EmptyImage.emptyHeader}`}>
                        {this.props.title || "You don't have anything!"}
                    </div>
                    <div className={`bd-empty-image-message`}>
                        {SimpleMarkdown.parseToReact(this.props.message || "You should probably get something.")}
                    </div>
                    {this.props.children}
                </div>;
    }
}