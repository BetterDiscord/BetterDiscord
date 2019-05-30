import Builtin from "../structs/builtin";
import {Utilities, DiscordModules} from "modules";

export default new class TwentyFourHour extends Builtin {
    get name() {return "24Hour";}
    get category() {return "Modules";}
    get id() {return "bda-gs-6";}

    enabled() {
        this.inject24Hour();
    }

    disabled() {
        if (this.cancel24Hour) this.cancel24Hour();
    }

    inject24Hour() {
        if (this.cancel24Hour) return;

        const twelveHour = new RegExp(`([0-9]{1,2}):([0-9]{1,2})\\s(AM|PM)`);
        const convert = (data) => {
            const matched = data.returnValue.match(twelveHour);
            if (!matched || matched.length !== 4) return;
            if (matched[3] === "AM") return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "00" : matched[1].padStart(2, "0")}:${matched[2]}`);
            return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "12" : parseInt(matched[1]) + 12}:${matched[2]}`);
        };

        const cancelCozy = Utilities.monkeyPatch(DiscordModules.TimeFormatter, "calendarFormat", {after: convert}); // Called in Cozy mode
        const cancelCompact = Utilities.monkeyPatch(DiscordModules.TimeFormatter, "dateFormat", {after: convert}); // Called in Compact mode
        this.cancel24Hour = () => {cancelCozy(); cancelCompact();}; // Cancel both
    }
};