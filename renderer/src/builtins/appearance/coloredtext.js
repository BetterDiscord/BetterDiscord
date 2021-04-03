import Builtin from "../../structs/builtin";
import {WebpackModules, DiscordModules} from "modules";



export default new class ColoredText extends Builtin {
    get name() {return "ColoredText";}
    get category() {return "appearance";}
    get id() {return "coloredText";}

    enabled() {
        this.injectColoredText();
    }

    disabled() {
        this.removeColoredText();
        this.unpatchAll();
    }

    injectColoredText() {
        const MessageContent = WebpackModules.getModule(m => m.type && m.type.displayName === "MessageContent");
        this.after(MessageContent, "type", (thisObject, [props], returnValue) => {
            const roleColor = this.getRoleColor(props.message.channel_id, props.message.author.id) || "";
            returnValue.props.style = {color: roleColor};
        });
    }

    getRoleColor(channelId, memberId) {
        const channel = DiscordModules.ChannelStore.getChannel(channelId);
        if (!channel) return "";
        const member = DiscordModules.GuildMemberStore.getMember(channel.guild_id, memberId);
        if (!member) return "";
        return member.colorString;
    }

    removeColoredText() {
        document.querySelectorAll(".markup-2BOw-j").forEach(elem => {
            elem.style.setProperty("color", "");
        });
    }
};
