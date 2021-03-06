import {React} from "modules";

export default class Edit extends React.Component {
    render() {
        const size = this.props.size || "24px";
        return <svg viewBox="0 0 24 24" fill="#FFFFFF" style={{width: size, height: size}} onClick={this.props.onClick}>
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                <path d="M0 0h24v24H0z" fill="none" />
               </svg>;
    }
}