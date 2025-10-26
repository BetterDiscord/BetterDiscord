import Builtin from "@structs/builtin";
import {getByStrings, getLazyByStrings, getModule} from "@webpack";
import {findInTree} from "@common/utils";

const TabBarComponent = getByStrings(["({getFocusableElements:()=>{let"], {searchExports: true});
const UserProfileComponent = getModule((m) => m.render?.toString?.().includes("pendingThemeColors"));

export default new class ThemeAttributes extends Builtin {
    get name() {return "ThemeAttributes";}
    get category() {return "general";}
    get id() {return "themeAttributes";}

    async enabled() {
        const MessageComponent = await getLazyByStrings(["isSystemMessage", "hasReply"], {defaultExport: false});
        this.before(MessageComponent, "Z", (thisObject, [args]) => {
            if (args?.["aria-roledescription"] !== "Message") return;
            const author = findInTree(args, (arg) => arg?.username, {walkable: ["props", "childrenMessageContent", "message", "author"]});
            const authorId = author?.id;
            if (!authorId) return;
            args["data-author-id"] = authorId;
            args["data-is-self"] = !!author.email;
        });
        this.after(TabBarComponent?.Item?.prototype, "render", (thisObject, args, returnValue) => {
            returnValue.props["data-tab-id"] = thisObject?.props?.id;
        });
        this.after(UserProfileComponent, "render", (thisObject, [{user}], returnValue) => {
            returnValue.props["data-member-id"] = user.id;
            returnValue.props["data-is-self"] = !!user.email;
        });
    }

    async disabled() {
        this.unpatchAll();
    }
};