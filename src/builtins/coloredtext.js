import Builtin from "../structs/builtin";
import {Utilities, WebpackModules} from "modules";

const MessageContent = WebpackModules.getModule(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));

export default new class ColoredText extends Builtin {
    get name() {return "ColoredText";}
    get category() {return "Modules";}
    get id() {return "bda-gs-7";}

    enabled() {
        this.injectColoredText();
    }

    disabled() {
        if (this.cancelColoredText) this.cancelColoredText();
    }

    injectColoredText() {
        if (this.cancelColoredText) return;

        this.cancelColoredText = Utilities.monkeyPatch(MessageContent.prototype, "render", {after: (data) => {
            Utilities.monkeyPatch(data.returnValue.props, "children", {silent: true, after: ({returnValue}) => {
                const markup = returnValue.props.children[1];
                const roleColor = data.thisObject.props.message.colorString;
                if (markup && roleColor) markup.props.style = {color: roleColor};
                return returnValue;
            }});
        }});
    }

    removeColoredText() {
        document.querySelectorAll(".markup-2BOw-j").forEach(elem => {
            elem.style.setProperty("color", "");
        });
    }
};