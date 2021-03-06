import {React} from "modules";

export default class FullScreen extends React.Component {
    render() {
        const size = this.props.size || "24px";
        return <svg className={this.props.className || ""} fill="#FFFFFF" viewBox="0 0 24 24" style={{width: size, height: size}} onClick={this.props.onClick}>
                    <path fill="none" d="M0 0h24v24H0V0z"/>
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>;
    }
}