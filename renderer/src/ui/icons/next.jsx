import {React} from "modules";

export default class ArrowRight extends React.Component {
    render() {
        return <svg viewBox="0 0 24 24" width="24" height="24" {...this.props}>
            <g fill="none" fillRule="evenodd">
                <polygon fill="currentColor" fillRule="nonzero" points="8.47 2 6.12 4.35 13.753 12 6.12 19.65 8.47 22 18.47 12"></polygon>
                <polygon points="0 0 24 0 24 24 0 24"></polygon>
            </g>
        </svg>;
    }
}