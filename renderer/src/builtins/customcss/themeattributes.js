import Builtin from "@structs/builtin";
import WebpackModules, {Filters} from "@modules/webpackmodules";
import Patcher from "@modules/patcher";
import Utilities from "@modules/utilities";

const MessageComponent = WebpackModules.getModule(Filters.byStrings("isSystemMessage", "hasReply"), {defaultExport: false});
const TabBarComponent = WebpackModules.getByProps("TabBar")?.TabBar;
const UserProfileComponent = WebpackModules.getModule((m) => m.render?.toString?.().includes(".ThemeContextProvider"));

export default new class ThemeAttributes extends Builtin {
    get name() {return "ThemeAttributes";}
    get category() {return "customcss";}
    get id() {return "themeAttributes";}

    enabled() {
        Patcher.before("ThemeAttributesPatcher", MessageComponent, "Z", (thisObject, [args]) => {
            if (args["aria-roledescription"] !== "Message") return;
            const author = Utilities.findInTree(args, (arg) => arg?.username, {walkable: ["props", "childrenMessageContent", "message", "author"]});
            const authorId = author?.id;
            if (!authorId) return;
            args["data-author-id"] = authorId;
            args["data-is-self"] = !!author.email;
        });
        Patcher.after("ThemeAttributesPatcher", TabBarComponent?.Item?.prototype, "render", (thisObject, args, returnValue) => {
            returnValue.props["data-tab-id"] = returnValue?._owner?.pendingProps?.id;
        });
        Patcher.after("ThemeAttributesPatcher", TabBarComponent, "Header", (thisObject, args, returnValue) => {
            returnValue.props["data-header-id"] = returnValue.props.children.props.children;
        });
        Patcher.after("ThemeAttributesPatcher", UserProfileComponent, "render", (thisObject, [{user}], returnValue) => {
            returnValue.props["data-member-id"] = user.id;
            returnValue.props["data-is-self"] = !!user.email;
        });
    }

    disabled() {
        Patcher.unpatchAll("ThemeAttributesPatcher");
    }
};