import Builtin from "../../structs/builtin";
import {DiscordModules} from "modules";

export default new class TwentyFourHour extends Builtin {
    get name() {return "24Hour";}
    get category() {return "appearance";}
    get id() {return "twentyFourHour";}

    enabled() {
        this.inject24Hour();
    }

    disabled() {
        this.unpatchAll();
    }

    inject24Hour() {
        const twelveHour = new RegExp(`([0-9]{1,2}):([0-9]{1,2})\\s(AM|PM)`);
        const convert = (thisObject, args, returnValue) => {
            const matched = returnValue.match(twelveHour);
            if (!matched || matched.length !== 4) return;
            if (matched[3] === "AM") return returnValue = returnValue.replace(matched[0], `${matched[1] === "12" ? "00" : matched[1].padStart(2, "0")}:${matched[2]}`);
            return returnValue = returnValue.replace(matched[0], `${matched[1] === "12" ? "12" : parseInt(matched[1]) + 12}:${matched[2]}`);
        };

        this.after(DiscordModules.TimeFormatter, "calendarFormat", convert); // Called in Cozy mode
        this.after(DiscordModules.TimeFormatter, "dateFormat", convert); // Called in Compact mode
    }
};