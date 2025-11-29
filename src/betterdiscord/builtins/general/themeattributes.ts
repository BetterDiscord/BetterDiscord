import Builtin from "@structs/builtin";
import {getLazyByStrings} from "@webpack";
import {findInTree} from "@common/utils";
import DiscordModules from "@modules/discordmodules";

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
        this.after(DiscordModules.TabBarComponent?.Item?.prototype, "render", (thisObject, args, returnValue) => {
            returnValue.props["data-tab-id"] = thisObject?.props?.id;
        });
        this.after(DiscordModules.UserProfileComponent, "render", (thisObject, [{user}], returnValue) => {
            returnValue.props["data-member-id"] = user.id;
            returnValue.props["data-is-self"] = !!user.email;
        });
    }

    async disabled() {
        this.unpatchAll();
    }
};