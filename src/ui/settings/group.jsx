import {SettingsCookie} from "data";
import {React, ReactDOM} from "modules";
import Title from "./title";
import Vertical from "./vertical";
import Divider from "./divider";
import Switch from "./switch";

export default class Group extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.state = {
            collapsed: this.props.collapsible && this.props.collapsed
        };
    }

    // render() {
    //     const {title, settings, button} = this.props;
    //     const buttonComponent = button ? React.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: button.onClick}, button.title) : null;
    //     return [React.createElement(SettingsTitle, {text: title}),
    //             buttonComponent,
    //             settings.map(setting => {
    //                 return React.createElement(Switch, {id: setting.id, key: setting.id, data: setting, checked: SettingsCookie[setting.id], onChange: (id, checked) => {
    //                     this.props.onChange(id, checked);
    //                 }});
    //             })];
    // }

    collapseGroup() {
        if (this.state.collapsed) return this.expandGroup();
        const container = ReactDOM.findDOMNode(this.container.current);
        // console.log(container.scrollHeight);
        container.style.setProperty("height", container.scrollHeight + "px");
        this.setState({collapsed: true}, () => setImmediate(() => container.style.setProperty("height", "")));//
    }

    expandGroup() {
        const container = ReactDOM.findDOMNode(this.container.current);
        // console.log(container.scrollHeight);
        container.style.setProperty("height", container.scrollHeight + "px");
        this.setState({collapsed: false}, () => setTimeout(() => container.style.setProperty("height", ""), 300));//, () => container.style.setProperty("height", "")
        //, () => container.style.setProperty("height", "")
    }

    render() {
        const {settings} = this.props;
        const groupClass = this.state.collapsed ? "bd-settings-group bd-settings-group-collapsed" : "bd-settings-group";
        return <div className={groupClass}>
                    <Title text={this.props.title} collapsible={this.props.collapsible} onClick={() => this.collapseGroup()} />
                            <Vertical className="bd-settings-container" ref={this.container}>
                                {settings.map((setting) => {
                                    return <Switch id={setting.id} key={setting.id} name={setting.text} note={setting.info} checked={SettingsCookie[setting.id]} onChange={(id, checked) => {
                                                this.props.onChange(id, checked);
                                            }} />;
                                })}
                            </Vertical>
                    {this.props.showDivider && <Divider />}
                </div>;
    }
}