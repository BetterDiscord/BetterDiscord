import {React} from "modules";

export default class Keyboard extends React.Component {
    render() {
        const size = this.props.size || "24px";
        return <svg className={this.props.className} viewBox="0 0 24 24" fill="#FFFFFF" style={{width: size, height: size}}>
                <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
                <path fill="none" d="M0 0h24v24H0zm0 0h24v24H0z" />
               </svg>;
    }
}