import Builtin from "@structs/builtin";
import {getLazyBySource} from "@webpack";
import {findInTree} from "@common/utils";
import DiscordModules from "@modules/discordmodules";

export default new class ThemeAttributes extends Builtin {
    get name() {return "ThemeAttributes";}
    get category() {return "general";}
    get id() {return "themeAttributes";}

    async enabled() {
        const MessageComponent = await getLazyBySource([".messageListItem"]);
        this.after(MessageComponent?.ZP, "type", (thisObject, [args], returnValue) => {
            const li = findInTree(returnValue, (node) => node?.className?.includes("messageListItem"));
            if (!li) return;
            const author = findInTree(args, (arg) => arg?.username, {walkable: ["message", "author"]});
            const authorId = author?.id;
            if (!authorId) return;
            li["data-author-id"] = authorId;
            li["data-author-username"] = author?.username;
            li["data-is-self"] = !!author.email;
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