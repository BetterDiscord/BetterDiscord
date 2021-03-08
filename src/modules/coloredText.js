import {settingsCookie} from "../0globals";
import BDV2 from "./v2";
import Utils from "./utils";

const MessageContent = BDV2.WebpackModules.find(m => m.type?.displayName === "MessageContent");
const ChannelStore = BDV2.WebpackModules.findByUniqueProperties(["getChannel", "getDMUserIds"]);
const GuildMemberStore = BDV2.WebpackModules.findByUniqueProperties(["getMember"]);

export default new class ColoredText {
    injectColoredText() {
        if (this.cancelColoredText) return;

        this.cancelColoredText = Utils.monkeyPatch(MessageContent, "type", {after: (data) => {
            const {methodArguments: [props], returnValue} = data;

            const roleColor = settingsCookie["bda-gs-7"] ? this.getRoleColor(props.message.channel_id, props.message.author.id) || "" : "";
            returnValue.props.style = {color: roleColor};
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
