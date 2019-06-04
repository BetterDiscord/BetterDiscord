import {SettingsCookie} from "data";
import {React} from "modules";
import Title from "./title";
import Divider from "./divider";
import Switch from "./switch";

const baseClassName = "bd-settings-group";

export default class Group extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.button && this.props.collapsible) {
            const original = this.props.button.onClick;
            this.props.button.onClick = (event) => {
                event.stopPropagation();
                original(...arguments);
            };
        }

        this.container = React.createRef();
        this.state = {
            collapsed: this.props.collapsible && this.props.collapsed
        };
    }

    toggleCollapse() {
        const container = this.container.current;
        const timeout = this.state.collapsed ? 300 : 1;
        container.style.setProperty("height", container.scrollHeight + "px");
        this.setState({collapsed: !this.state.collapsed}, () => setTimeout(() => container.style.setProperty("height", ""), timeout));
    }

    render() {
        const {settings} = this.props;
        const collapseClass = this.props.collapsible ? `collapsible ${this.state.collapsed && "collapsed"}` : "";
        const groupClass = `${baseClassName} ${collapseClass}`;

        return <div className={groupClass}>
                    <Title text={this.props.title} collapsible={this.props.collapsible} onClick={() => this.toggleCollapse()} button={this.props.button} />
                    <div className="bd-settings-container" ref={this.container}>
                        {settings.map((setting) => {
                            return <Switch id={setting.id} key={setting.id} name={setting.text} note={setting.info} checked={SettingsCookie[setting.id]} onChange={(id, checked) => {
                                        this.props.onChange(id, checked);
                                    }} />;
                        })}
                    </div>
                    {this.props.showDivider && <Divider />}
                </div>;
    }
}