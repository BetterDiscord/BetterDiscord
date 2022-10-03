import {React} from "modules";
import Title from "./title";
import Divider from "../divider";

const baseClassName = "bd-settings-group";

export default class Drawer extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.button && this.props.collapsible) {
            const original = this.props.button.onClick;
            this.props.button.onClick = (event) => {
                event.stopPropagation();
                original(...arguments);
            };
        }

        if (!this.props.hasOwnProperty("shown")) this.props.shown = true;

        this.container = React.createRef();
        this.state = {
            collapsed: this.props.collapsible && !this.props.shown
        };

        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    toggleCollapse() {
        const container = this.container.current;
        const timeout = this.state.collapsed ? 300 : 1;
        container.style.setProperty("height", container.scrollHeight + "px");
        container.classList.add("animating");
        this.setState({collapsed: !this.state.collapsed}, () => setTimeout(() => {
            container.style.setProperty("height", "");
            container.classList.remove("animating");
        }, timeout));
        if (this.props.onDrawerToggle) this.props.onDrawerToggle(this.state.collapsed);
    }

    render() {
        const collapseClass = this.props.collapsible ? `collapsible ${this.state.collapsed ? "collapsed" : "expanded"}` : "";
        const groupClass = `${baseClassName} ${collapseClass}`;

        return <div className={groupClass}>
                    <Title text={this.props.name} collapsible={this.props.collapsible} onClick={this.toggleCollapse} button={this.props.button} isGroup={true} />
                    <div className="bd-settings-container" ref={this.container}>
                        {this.props.children}
                    </div>
                    {this.props.showDivider && <Divider />}
                </div>;
    }
}