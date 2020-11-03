import {React} from "modules";

export default class Patreon extends React.Component {
    render() {
        const size = this.props.size || "18px";
        return <svg viewBox="0 0 24 24" fill="#FFFFFF" style={{width: size, height: size}} onClick={this.props.onClick}>
                    <path d="m0 .5h4.219v23h-4.219z"/>
                    <path d="m15.384.5c-4.767 0-8.644 3.873-8.644 8.633 0 4.75 3.877 8.61 8.644 8.61 4.754 0 8.616-3.865 8.616-8.61 0-4.759-3.863-8.633-8.616-8.633z"/>
                </svg>;
    }
}