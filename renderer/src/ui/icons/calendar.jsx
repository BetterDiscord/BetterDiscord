import {React} from "modules";

export default class Calendar extends React.Component {
    render() {
        return <svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24" {...this.props}>
            <g fill="none" fill-rule="evenodd">
                <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" />
                <rect width="24" height="24" />
            </g>
        </svg>;
    }
}