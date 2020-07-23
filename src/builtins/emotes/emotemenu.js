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

    constructor() {
        super();
    }
    async enabled() {
        if (this.hideEmojis) this.enableHideEmojis();
        this.before(EmojiPicker, "type", (_, [args], ret) => {
            if(args.expressionPickerView == "emoji" && this.hideEmojis) args.expressionPickerView = "gif";
        }) 
		this.after(EmojiPicker, "type", (_, [args], ret) => {
			const head = Utilities.getNestedProp(ret, "props.children.props.children.1.props.children.0.props.children.props.children");
			const body = Utilities.getNestedProp(ret, "props.children.props.children.1.props.children");
			if(!head || !body) return ret;
			const selected = args.expressionPickerView;
			let tabProps = head[0].props;
			head.push(...Tabs.map(e => React.createElement("div", {
				id: e.id+"-tab",
				role: "tab",
				"aria-selected": selected == e.id,
				className: tabProps.className,
				children: React.createElement(tabProps.children.type, {
					viewType: e.id,
					isActive: selected == e.id,
					children: e.label,
					setActiveView: tabProps.children.props.setActiveView
				})
            })))
            if(Tabs.map(e => e.id).includes(selected)) body[2] = Tabs.find(e=>e.id == selected).element();
            if(this.hideEmojis) head.splice(head.findIndex(e=>e.props.id == "emoji-picker-tab"), 1);
		})
	}

    disabled() {
        this.unpatchAll();
    }

};