import Builtin from "../../structs/builtin";

import {Utilities} from "modules";

import EmoteModule from "./emotes";

export default new class EmoteAutocaps extends Builtin {
    get name() {return "EmoteAutocapitalize";}
    get collection() {return "emotes";}
    get category() {return "general";}
    get id() {return "autoCaps";}

    enabled() {
        $("body").off(".bdac");
        $("body").on("keyup.bdac change.bdac paste.bdac", $(".channelTextArea-1LDbYG textarea:first"), () => {
            const text = $(".channelTextArea-1LDbYG textarea:first").val();
            if (text == undefined) return;

            const lastWord = text.split(" ").pop();
            if (lastWord.length > 3) {
                if (lastWord == "danSgame") return;
                const ret = this.capitalize(lastWord.toLowerCase());
                if (ret !== null && ret !== undefined) {
                    Utilities.insertText(Utilities.getTextArea()[0], text.replace(lastWord, ret));
                }
            }
        });
    }

    disabled() {
        $("body").off(".bdac");
    }

    capitalize(value) {
        const res = EmoteModule.getCategory("TwitchGlobal");
        for (const p in res) {
            if (res.hasOwnProperty(p) && value == (p + "").toLowerCase()) {
                return p;
            }
        }
    }
};