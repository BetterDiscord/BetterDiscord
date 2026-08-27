import DiscordModules from "@modules/discordmodules";

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
 * `Components` is a utility containing commonly used React components. An instance is available on {@link BdApi}.
 */
class Components {
    /** @ignore */
    constructor() {};

    Tooltip = DiscordModules.Tooltip;
    SettingItem = SettingItem;
    ColorInput = ColorInput;
    DropdownInput = DropdownInput;
    KeybindInput = KeybindInput;
    NumberInput = NumberInput;
    RadioInput = RadioInput;
    SearchInput = SearchInput;
    SliderInput = SliderInput;
    SwitchInput = SwitchInput;
    TextInput = TextInput;
    SettingGroup = SettingGroup;
    ErrorBoundary = ErrorBoundary;
    Text = Text;
    Flex = Flex;
    Button = Button;
    Spinner = Spinner;
}

Object.freeze(Components);
Object.freeze(Components.prototype);

export default Components;