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

        if (!this.props.hasOwnProperty("shown")) this.props.shown = true;

        this.container = React.createRef();
        this.state = {
            collapsed: this.props.collapsible && !this.props.shown
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
        if (this.props.id) this.props.onChange(this.props.id, id, value);
        else this.props.onChange(id, value);
        this.forceUpdate();
    }

    render() {
        const {settings} = this.props;
        const collapseClass = this.props.collapsible ? `collapsible ${this.state.collapsed && "collapsed"}` : "";
        const groupClass = `${baseClassName} ${collapseClass}`;

        return <div className={groupClass}>
                    <Title text={this.props.name} collapsible={this.props.collapsible} onClick={() => this.toggleCollapse()} button={this.props.button} isGroup={true} />
                    <div className="bd-settings-container" ref={this.container}>
                        {settings.filter(s => !s.hidden).map((setting) => {
                            // console.log(setting);
                            const item = <Switch disabled={setting.disabled} id={setting.id} key={setting.id} name={setting.name} note={setting.note} checked={setting.value} onChange={this.onChange} />;
                            const shouldHide = setting.shouldHide ? setting.shouldHide() : false;
                            if (!shouldHide) return item;
                        })}
                    </div>
                    {this.props.showDivider && <Divider />}
                </div>;
    }
}