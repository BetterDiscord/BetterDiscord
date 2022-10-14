import {React} from "modules";
import Drawer from "./drawer";
import Switch from "./components/switch";
import Dropdown from "./components/dropdown";
import Number from "./components/number";
import Item from "./components/item";
import Textbox from "./components/textbox";
import Slider from "./components/slider";
import Radio from "./components/radio";
import Keybind from "./components/keybind";
import Color from "./components/color";


export default class Group extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(id, value) {
        if (!this.props.onChange) return;
        if (this.props.id) this.props.onChange(this.props.id, id, value);
        else this.props.onChange(id, value);
        this.forceUpdate();
    }

    render() {
        const {settings} = this.props;

        return <Drawer collapsible={this.props.collapsible} name={this.props.name} button={this.props.button} shown={this.props.shown} onDrawerToggle={this.props.onDrawerToggle} showDivider={this.props.showDivider}>
                    {settings.filter(s => !s.hidden).map((setting) => {
                        let component = null;
                        if (setting.type == "dropdown") component = <Dropdown disabled={setting.disabled} id={setting.id} options={setting.options} value={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                        if (setting.type == "number") component = <Number disabled={setting.disabled} id={setting.id} min={setting.min} max={setting.max} step={setting.step} value={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                        if (setting.type == "switch") component = <Switch disabled={setting.disabled} id={setting.id} checked={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                        if (setting.type == "text") component = <Textbox disabled={setting.disabled} id={setting.id} value={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                        if (setting.type == "slider") component = <Slider disabled={setting.disabled} id={setting.id} min={setting.min} max={setting.max} step={setting.step} value={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                        if (setting.type == "radio") component = <Radio disabled={setting.disabled} id={setting.id} name={setting.id} options={setting.options} value={setting.value} onChange={this.onChange.bind(this, setting.id)} />;
                        if (setting.type == "keybind") component = <Keybind disabled={setting.disabled} id={setting.id} value={setting.value} max={setting.max} onChange={this.onChange.bind(this, setting.id)} />;
                        if (setting.type == "color") component = <Color disabled={setting.disabled} id={setting.id} value={setting.value} defaultValue={setting.defaultValue} colors={setting.colors} onChange={this.onChange.bind(this, setting.id)} />;
                        if (!component) return null;
                        return <Item id={setting.id} inline={setting.type !== "radio"} key={setting.id} name={setting.name} note={setting.note}>{component}</Item>;
                    })}
                </Drawer>;
    }
}