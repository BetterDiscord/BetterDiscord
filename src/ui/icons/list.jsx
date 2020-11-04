import {React} from "modules";

export default class List extends React.Component {
    render() {
        const size = this.props.size || "20px";
        return <svg viewBox="2 2 20 20" fill="#FFFFFF" style={{width: size, height: size}}>
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 18h17v-6H4v6zM4 5v6h17V5H4z"/>
            </svg>;
    }
}