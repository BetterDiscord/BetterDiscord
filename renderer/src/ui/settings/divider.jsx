import {React, Utilities} from "modules";

export default class Divider extends React.Component {
    render() {
        return <div className={Utilities.joinClassNames("bd-divider", this.props.className)} />;
    }
}