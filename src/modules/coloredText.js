import {settingsCookie} from "../0globals";
import BDV2 from "./v2";
import Utils from "./utils";

const ChannelStore = BDV2.WebpackModules.findByUniqueProperties(["getChannel", "getGuildChannels"]);
const GuildMemberStore = BDV2.WebpackModules.findByUniqueProperties(["getMember"]);

export default new class ColoredText {
    injectColoredText() {
        if (this.cancelColoredText) return;
        if (!BDV2.MessageComponent) return;

        this.cancelColoredText = Utils.monkeyPatch(BDV2.MessageComponent, "default", {before: (data) => {
            const props = data.methodArguments[0];
            if (!props || !props.childrenMessageContent) return;
            const messageContent = props.childrenMessageContent;

            if (!messageContent.type || !messageContent.type.type || messageContent.type.type.displayName != "MessageContent") return;
            const originalType = messageContent.type.type;
            if (originalType.__originalMethod) return; // Don't patch again
            const self = this;
            messageContent.type.type = function(props) {
                const returnValue = originalType(props);
                const roleColor = settingsCookie["bda-gs-7"] ? self.getRoleColor(props.message.channel_id, props.message.author.id) || "" : "";
                returnValue.props.style = {color: roleColor};
                return returnValue;
            };

            messageContent.type.type.__originalMethod = originalType;
            Object.assign(messageContent.type.type, originalType);
        }});
    }

    getRoleColor(channelId, memberId) {
        const channel = ChannelStore.getChannel(channelId);
        if (!channel) return "";
        const member = GuildMemberStore.getMember(channel.guild_id, memberId);
        if (!member) return "";
        return member.colorString;
    }

    removeColoredText() {
        document.querySelectorAll(".markup-2BOw-j").forEach(elem => {
            elem.style.setProperty("color", "");
        });
    }
};
