import Builtin from "@structs/builtin";
import WebpackModules, {Filters} from "@modules/webpackmodules";
import Utilities from "@modules/utilities";

const MessageComponent = WebpackModules.getModule(Filters.byStrings("isSystemMessage", "hasReply"), {defaultExport: false});
const TabBarComponent = WebpackModules.getModule(Filters.byStrings("({getFocusableElements:()=>{let"), {searchExports: true});
const UserProfileComponent = WebpackModules.getModule((m) => m.render?.toString?.().includes("pendingThemeColors"));

export default new class ThemeAttributes extends Builtin {
    get name() {return "ThemeAttributes";}
    get category() {return "general";}
    get id() {return "themeAttributes";}

    enabled() {
        this.before(MessageComponent, "Z", (thisObject, [args]) => {
            if (args["aria-roledescription"] !== "Message") return;
            const author = Utilities.findInTree(args, (arg) => arg?.username, {walkable: ["props", "childrenMessageContent", "message", "author"]});
            const authorId = author?.id;
            if (!authorId) return;
            args["data-author-id"] = authorId;
            args["data-is-self"] = !!author.email;
        });
        this.after(TabBarComponent?.Item?.prototype, "render", (thisObject, args, returnValue) => {
            returnValue.props["data-tab-id"] = returnValue?._owner?.pendingProps?.id;
        });
        this.after(TabBarComponent, "Header", (thisObject, args, returnValue) => {
            returnValue.props["data-header-id"] = returnValue.props.children.props.children;
        });
        this.after(UserProfileComponent, "render", (thisObject, [{user}], returnValue) => {
            returnValue.props["data-member-id"] = user.id;
            returnValue.props["data-is-self"] = !!user.email;
        });
    }

    disabled() {
        this.unpatchAll();
    }
};