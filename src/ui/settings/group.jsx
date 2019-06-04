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

        this.onChange = this.onChange.bind(this);
    }

    toggleCollapse() {
        const container = this.container.current;
        const timeout = this.state.collapsed ? 300 : 1;
        container.style.setProperty("height", container.scrollHeight + "px");
        this.setState({collapsed: !this.state.collapsed}, () => setTimeout(() => container.style.setProperty("height", ""), timeout));
    }

    onChange(id, value) {
        if (!this.props.onChange) return;
        if (this.props.id) return this.props.onChange(this.props.id, id, value);
        this.props.onChange(id, value);
        this.forceUpdate();
    }

    render() {
        const {settings} = this.props;
        const collapseClass = this.props.collapsible ? `collapsible ${this.state.collapsed && "collapsed"}` : "";
        const groupClass = `${baseClassName} ${collapseClass}`;

        return <div className={groupClass}>
                    <Title text={this.props.title} collapsible={this.props.collapsible} onClick={() => this.toggleCollapse()} button={this.props.button} />
                    <div className="bd-settings-container" ref={this.container}>
                        {settings.map((setting) => {
                            const item = <Switch id={setting.id} key={setting.id} name={setting.text} note={setting.info} checked={SettingsCookie[setting.id]} onChange={this.onChange} />;
                            const shouldHide = setting.shouldHide ? setting.shouldHide() : false;
                            if (!shouldHide) return item;
                        })}
                    </div>
                    {this.props.showDivider && <Divider />}
                </div>;
    }
}