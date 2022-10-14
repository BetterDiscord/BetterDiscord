import {React} from "modules";

export default class ArrowLeft extends React.Component {
    render() {
        return <svg viewBox="0 0 24 24" width="24" height="24" {...this.props}>
            <g fill="none" fillRule="evenodd">
                <polygon fill="currentColor" fillRule="nonzero" points="18.35 4.35 16 2 6 12 16 22 18.35 19.65 10.717 12"></polygon>
                <polygon points="0 0 24 0 24 24 0 24"></polygon>
            </g>
        </svg>;
    }
}