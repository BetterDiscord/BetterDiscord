import Builtin from "../../structs/builtin";
import {Utilities, WebpackModules, React} from "modules";
import Tabs from "./tabs";

const EmojiPicker = WebpackModules.find(m => m.type && m.type.displayName == "ExpressionPicker");
export default new class EmoteMenu extends Builtin {
    get name() {return "EmoteMenu";}
    get collection() {return "emotes";}
    get category() {return "general";}
    get id() {return "emoteMenu";}
    get hideEmojisID() {return "hideEmojiMenu";}
    get hideEmojis() {return this.get(this.hideEmojisID);}

    enabled() {
        this.before(EmojiPicker, "type", (_, [props]) => {
            if (props.expressionPickerView == "emoji" && this.hideEmojis) props.expressionPickerView = "gif";
        }); 
        this.after(EmojiPicker, "type", (_, [props], returnValue) => {
            const head = Utilities.getNestedProp(returnValue, "props.children.props.children.1.props.children.0.props.children.props.children");
            const body = Utilities.getNestedProp(returnValue, "props.children.props.children.1.props.children");
            if (!head || !body) return returnValue;
            
            const selected = props.expressionPickerView;
            const currentTab = Tabs.find(e => e.id === selected);
            const tabProps = head[0].props;
            head.push(
                ...Tabs.map(e => React.createElement("div", {
                    "id": e.id + "-tab",
                    "role": "tab",
                    "aria-selected": selected == e.id,
                    "className": tabProps.className,
                }, React.createElement(tabProps.children.type, {
                    viewType: e.id,
                    isActive: selected == e.id,
                    setActiveView: tabProps.children.props.setActiveView
                }, e.label))
            ));
            if (currentTab) body[2] = currentTab.element();
            if (this.hideEmojis) head.splice(head.findIndex(e=>e.props.id == "emoji-picker-tab"), 1);
        });
    }

    disabled() {
        this.unpatchAll();
    }

};