import {settingsCookie} from "../0globals";
import BDV2 from "./v2";
import Utils from "./utils";

export default new class TFHour {
    inject24Hour() {
        if (this.cancel24Hour) return;

        const twelveHour = new RegExp(`([0-9]{1,2}):([0-9]{1,2})\\s(AM|PM)`);
        const convert = (data) => {
            if (!settingsCookie["bda-gs-6"]) return;
            const matched = data.returnValue.match(twelveHour);
            if (!matched || matched.length !== 4) return;
            if (matched[3] === "AM") return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "00" : matched[1].padStart(2, "0")}:${matched[2]}`);
            return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "12" : parseInt(matched[1]) + 12}:${matched[2]}`);
        };

        const cancelCozy = Utils.monkeyPatch(BDV2.TimeFormatter, "calendarFormat", {after: convert}); // Called in Cozy mode
        const cancelCompact = Utils.monkeyPatch(BDV2.TimeFormatter, "dateFormat", {after: convert}); // Called in Compact mode
        this.cancel24Hour = () => {cancelCozy(); cancelCompact();}; // Cancel both
    }

    remove24Hour() {
        if (this.cancel24Hour) this.cancel24Hour();
    }
};