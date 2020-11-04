import {React} from "modules";

export default class Grid extends React.Component {
    render() {
        const size = this.props.size || "20px";
        return <svg viewBox="2 2 20 20" fill="#FFFFFF" style={{width: size, height: size}}>
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
            </svg>;
    }
}