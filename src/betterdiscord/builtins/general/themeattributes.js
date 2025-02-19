import Builtin from "@structs/builtin";
import {getByStrings, getModule} from "@webpack";
import {findInTree} from "@common/utils";

const MessageComponent = getByStrings([ "isSystemMessage", "hasReply" ], {defaultExport: false});
const TabBarComponent = getByStrings([ "({getFocusableElements:()=>{let" ], {searchExports: true});
const UserProfileComponent = getModule((m) => m.render?.toString?.().includes("pendingThemeColors"));

export default new class ThemeAttributes extends Builtin {
    get name() {return "ThemeAttributes";}
    get category() {return "general";}
    get id() {return "themeAttributes";}

    enabled() {
        this.before(MessageComponent, "Z", (thisObject, [args]) => {
            if (args["aria-roledescription"] !== "Message") return;
            const author = findInTree(args, (arg) => arg?.username, {walkable: ["props", "childrenMessageContent", "message", "author"]});
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