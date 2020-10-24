import Builtin from "../../structs/builtin";
import WebpackModules from "../../modules/webpackmodules";
import Utilities from "../../modules/utilities";

export default new class HideGIFButton extends Builtin {
    get name() {return "HideGIFButton";}
    get category() {return "appearance";}
    get id() {return "hideGIFButton";}

    enabled() {
        this.after(WebpackModules.find(m => m.type && m.type.render && m.type.render.displayName === "ChannelTextAreaContainer").type, "render", (_, __, returnValue) => {
            const buttons = Utilities.getNestedProp(returnValue, "props.children.props.children.props.children.1.props.children.props.children.2.props.children");
            if (Array.isArray(buttons)) {
                for (const button of buttons) {
                    if (!button) continue;
                    const renderFunc = Utilities.getNestedProp(button, "type.type.render");
                    if (!renderFunc) continue;
    
                    // ChannelStickerPickerButton for sticker button
                    if (renderFunc.displayName === "ChannelGIFPickerButton") {
                        button.props.disabled = true;
                        break;
                    }
                }
            }
        });
    }

    disabled() {
        this.unpatchAll();
    }
};