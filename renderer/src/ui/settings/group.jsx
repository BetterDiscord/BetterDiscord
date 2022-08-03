import Logger from "common/logger";
import {React} from "modules";
import Title from "./title";
import Divider from "../divider";
import Switch from "./components/switch";
import Dropdown from "./components/dropdown";
import Number from "./components/number";
import Item from "./components/item";

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

    onChange(id, value) {
        if (!this.props.onChange) return;
        if (this.props.id) this.props.onChange(this.props.id, id, value);
        else this.props.onChange(id, value);
        this.forceUpdate();
    }

    render() {
        const {settings} = this.props;
        const collapseClass = this.props.collapsible ? `collapsible ${this.state.collapsed ? "collapsed" : "expanded"}` : "";
        const groupClass = `${baseClassName} ${collapseClass}`;

        return <div className={groupClass}>
                    <Title text={this.props.name} collapsible={this.props.collapsible} onClick={this.toggleCollapse} button={this.props.button} isGroup={true} />
                    <div className="bd-settings-container" ref={this.container}>
                        {settings.filter(s => !s.hidden).map((setting) => {
                            let component = null;
                            if (setting.type == "dropdown") component = <Dropdown disabled={setting.disabled} id={setting.id} options={setting.options} value={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                            if (setting.type == "number") component = <Number disabled={setting.disabled} id={setting.id} min={setting.min} max={setting.max} step={setting.step} value={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                            if (setting.type == "switch") component = <Switch disabled={setting.disabled} id={setting.id} checked={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                            if (!component) return null;
                            return <Item id={setting.id} key={setting.id} name={setting.name} note={setting.note}>{component}</Item>;
                        })}
                    </div>
                    {this.props.showDivider && <Divider />}
                </div>;
    }
}

const originalRender = Group.prototype.render;
Object.defineProperty(Group.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {Logger.warn("Group", "Addon policy for plugins #5 https://github.com/BetterDiscord/BetterDiscord/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});