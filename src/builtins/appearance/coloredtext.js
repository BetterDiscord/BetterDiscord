import Builtin from "../../structs/builtin";
import {WebpackModules} from "modules";

const MessageContent = WebpackModules.getModule(m => m.default && m.default.displayName && m.default.displayName == "Message");

export default new class ColoredText extends Builtin {
    get name() {return "ColoredText";}
    get category() {return "appearance";}
    get id() {return "coloredText";}

    enabled() {
        this.injectColoredText();
    }

    disabled() {
        this.unpatchAll();
    }

    injectColoredText() {
        this.after(MessageContent.prototype, "render", (thisObject, args, retVal) => {
            this.after(retVal.props, "children", {after: ({returnValue}) => {
                const markup = returnValue.props.children[1];
                const roleColor = thisObject.props.message.colorString;
                if (markup && roleColor) markup.props.style = {color: roleColor};
            }});
        });
    }

    removeColoredText() {
        document.querySelectorAll(".markup-2BOw-j").forEach(elem => {
            elem.style.setProperty("color", "");
        });
    }
};