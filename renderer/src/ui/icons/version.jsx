import {React} from "modules";

export default class Version extends React.Component {
    render() {
        return <svg viewBox="0 0 24 24" width="24" height="24" {...this.props}>
            <path d="M21.707 13.293l-11-11C10.519 2.105 10.266 2 10 2H3c-.553 0-1 .447-1 1v7c0 .266.105.519.293.707l11 11c.195.195.451.293.707.293s.512-.098.707-.293l7-7c.391-.391.391-1.023 0-1.414zM7 9c-1.106 0-2-.896-2-2 0-1.106.894-2 2-2 1.104 0 2 .894 2 2 0 1.104-.896 2-2 2z" fill="currentColor"></path>
        </svg>;
    }
}