
import DiscordModules from "@modules/discordmodules";

/** @internal */
// export const Tooltip = DiscordModules.Tooltip;
// export {default as ColorInput} from "@ui/settings/components/color";
// export {default as DropdownInput} from "@ui/settings/components/dropdown";
// export {default as SettingItem} from "@ui/settings/components/item";
// export {default as KeybindInput} from "@ui/settings/components/keybind";
// export {default as NumberInput} from "@ui/settings/components/number";
// export {default as RadioInput} from "@ui/settings/components/radio";
// export {default as SearchInput} from "@ui/settings/components/search";
// export {default as SliderInput} from "@ui/settings/components/slider";
// export {default as SwitchInput} from "@ui/settings/components/switch";
// export {default as TextInput} from "@ui/settings/components/textbox";
// export {default as SettingGroup} from "@ui/settings/group";
// export {default as ErrorBoundary} from "@ui/errorboundary";
// export {default as Text} from "@ui/base/text";
// export {default as Flex} from "@ui/base/flex";
// export {default as Button} from "@ui/base/button";
// export {default as Spinner} from "@ui/spinner";

import ColorInput from "@ui/settings/components/color";
import DropdownInput from "@ui/settings/components/dropdown";
import SettingItem from "@ui/settings/components/item";
import KeybindInput from "@ui/settings/components/keybind";
import NumberInput from "@ui/settings/components/number";
import RadioInput from "@ui/settings/components/radio";
import SearchInput from "@ui/settings/components/search";
import SliderInput from "@ui/settings/components/slider";
import SwitchInput from "@ui/settings/components/switch";
import TextInput from "@ui/settings/components/textbox";
import SettingGroup from "@ui/settings/group";
import ErrorBoundary from "@ui/errorboundary";
import Text from "@ui/base/text";
import Flex from "@ui/base/flex";
import Button from "@ui/base/button";
import Spinner from "@ui/spinner";

/**
 * `Components` is a namespace holding a series of React components. It is available under {@link BdApi}.
 * @summary {@link Components} a namespace holding a series of React components
 * @hideconstructor
 */
class Components {
    static get Tooltip() {return DiscordModules.Tooltip;}
    static get ColorInput() {return ColorInput;}
    static get DropdownInput() {return DropdownInput;}
    static get SettingItem() {return SettingItem;}
    static get KeybindInput() {return KeybindInput;}
    static get NumberInput() {return NumberInput;}
    static get RadioInput() {return RadioInput;}
    static get SearchInput() {return SearchInput;}
    static get SliderInput() {return SliderInput;}
    static get SwitchInput() {return SwitchInput;}
    static get TextInput() {return TextInput;}
    static get SettingGroup() {return SettingGroup;}
    static get ErrorBoundary() {return ErrorBoundary;}
    static get Text() {return Text;}
    static get Flex() {return Flex;}
    static get Button() {return Button;}
    static get Spinner() {return Spinner;}
}

Object.freeze(Components);
Object.freeze(Components.prototype);

export default Components;