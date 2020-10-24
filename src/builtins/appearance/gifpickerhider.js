import Builtin from "../../structs/builtin";
import WebpackModules from "../../modules/webpackmodules";
import Utilities from "../../modules/utilities";

export default new class GifPickerHider extends Builtin {
    get name() {return "GifPickerHider";}
    get category() {return "appearance";}
    get id() {return "gifPickerHider";}

    enabled() {
        this.unpatch = this.after(WebpackModules.find(m => m.type && m.type.render && m.type.render.displayName === "ChannelTextAreaContainer").type, "render", (_, __, returnValue) => {
            const buttons = Utilities.getNestedProp(returnValue, "props.children.props.children.props.children.1.props.children.props.children.2.props.children");
            if (Array.isArray(buttons)) {
                for (const button of buttons) {
                    if (!button) continue;
                    const renderFunc = Utilities.getNestedProp(button, "type.type.render");
                    if (!renderFunc) continue;
    
                    // "ChannelGIFPickerButton" for sticker button
                    if (["ChannelStickerPickerButton"].includes(renderFunc.displayName)) {
                        button.props.disabled = true;
                        break;
                    }
                }
            }
        });
    }

    disabled() {
        this.unpatch();
    }
};