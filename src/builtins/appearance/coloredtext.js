import Builtin from "../../structs/builtin";
import {WebpackModules} from "modules";



export default new class ColoredText extends Builtin {
    get name() {return "ColoredText";}
    get category() {return "appearance";}
    get id() {return "coloredText";}

    enabled() {
        this.injectColoredText();
    }

    disabled() {
        this.removeColoredText();
        this.unpatchAll();
    }

    injectColoredText() {
        const MessageContent = WebpackModules.getModule(m => m.default && m.default.displayName && m.default.displayName == "Message");
        this.before(MessageContent, "default", (thisObject, [props]) => {
            if (!props || !props.childrenMessageContent) return;
            const messageContent = props.childrenMessageContent;
            if (!messageContent.type || !messageContent.type.type || messageContent.type.type.displayName != "MessageContent") return;

            const originalType = messageContent.type.type;
            if (originalType.__originalMethod) return; // Don't patch again
            messageContent.type.type = function(childProps) {
                const returnValue = originalType(childProps);
                const roleColor = childProps.message.colorString || "";
                returnValue.props.style = {color: roleColor};
                return returnValue;
            };

            messageContent.type.type.__originalMethod = originalType;
            Object.assign(messageContent.type.type, originalType);
        });
    }

    removeColoredText() {
        document.querySelectorAll(".markup-2BOw-j").forEach(elem => {
            elem.style.setProperty("color", "");
        });
    }
};