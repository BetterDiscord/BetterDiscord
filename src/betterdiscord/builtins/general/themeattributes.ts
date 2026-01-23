import Builtin from "@structs/builtin";
import {getByStrings, getLazyBySource, getModule} from "@webpack";
import {findInTree} from "@common/utils";

const TabBarComponent = getByStrings(["({getFocusableElements:()=>{let"], {searchExports: true});
const UserProfileComponent = getModule((m) => m.render?.toString?.().includes("pendingThemeColors"));

export default new class ThemeAttributes extends Builtin {
    get name() {return "ThemeAttributes";}
    get category() {return "general";}
    get id() {return "themeAttributes";}

    async enabled() {
        const MessageComponent = await getLazyBySource(["Message must not be a thread starter message"]);
        const VoiceUserComponent = await getLazyBySource(["avatarContainerClass", "userNameClassName"]);
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
        this.after(TabBarComponent?.Item?.prototype, "render", (thisObject, args, returnValue) => {
            returnValue.props["data-tab-id"] = thisObject?.props?.id;
        });
        this.after(UserProfileComponent, "render", (thisObject, [{user}], returnValue) => {
            returnValue.props["data-member-id"] = user.id;
            returnValue.props["data-is-self"] = !!user.email;
        });
        this.after(VoiceUserComponent, "Ay", (thisObject, [{speaking}], returnValue) => {
            const VoiceUser = findInTree(returnValue, (node) => node?.attributes, {walkable: ["ref", "current"]});
            if (!VoiceUser) return;
            VoiceUser.dataset.speaking = speaking;
        });
    }

    async disabled() {
        this.unpatchAll();
    }
};