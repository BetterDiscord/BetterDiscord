import Builtin from "../../structs/builtin";
import WebpackModules from "../../modules/webpackmodules";
import Utilities from "../../modules/utilities";

export default new class HideGiftButton extends Builtin {
    get name() {return "HideGiftButton";}
    get category() {return "appearance";}
    get id() {return "hideGiftButton";}

    enabled() {
        this.after(WebpackModules.find(m => m.type && m.type.render && m.type.render.displayName === "ChannelTextAreaContainer").type, "render", (_, __, returnValue) => {
            const buttons = Utilities.getNestedProp(returnValue, "props.children.props.children.1.props.children.props.children.2.props.children");
            if (Array.isArray(buttons)) {
                for (const button of buttons) {
                    if (!button || !button.props) continue;
                    if (button.props.hasOwnProperty("shouldRenderPremiumGiftButton")) {
                        button.props.shouldRenderPremiumGiftButton = false;
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