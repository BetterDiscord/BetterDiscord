import {React, WebpackModules} from "modules";
import SimpleMarkdown from "../../structs/markdown";

const EmptyImageClasses = WebpackModules.getByProps("emptyImage") || {};

export default class EmptyImage extends React.Component {
    render() {
        return <div className={`bd-empty-image-container ${EmptyImageClasses.emptyContainer}` + (this.props.className ? ` ${this.props.className}` : "")}>
                    <div className={`bd-empty-image ${EmptyImageClasses.emptyImage}`}></div>
                    <div className={`bd-empty-image-header ${EmptyImageClasses.emptyHeader}`}>
                        {this.props.title || "You don't have anything!"}
                    </div>
                    <div className={`bd-empty-image-message`}>
                        {SimpleMarkdown.parseToReact(this.props.message || "You should probably get something.")}
                    </div>
                    {this.props.children}
                </div>;
    }
}