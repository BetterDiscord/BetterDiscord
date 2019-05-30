import {React} from "modules";

export default class V2C_List extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <ul className={this.props.className}>{this.props.children}</ul>;
    }
}