import {React} from "modules";

export default class Description extends React.Component {
    render() {
        return <svg viewBox="0 0 12 12" width="24" height="24" {...this.props}>
            <path d="M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z" fill="currentColor"></path>
        </svg>;
    }
}