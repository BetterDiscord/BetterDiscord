import {React} from "modules";

const className = "bd-vertical-container";

export default class VerticalContainer extends React.Component {

    render() {
        const containerClass = this.props.className ? `${className} ${this.props.className}` : className;
        return <div className={containerClass}>{this.props.children}</div>;
    }
}