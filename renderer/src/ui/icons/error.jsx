import {React} from "modules";

export default class Error extends React.Component {
    render() {
        const size = this.props.size || "24px";
        return <svg viewBox="0 0 24 24" fill="#FFFFFF" style={{width: size, height: size}} onClick={this.props.onClick} className={this.props.className}>
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
               </svg>;
    }
}

