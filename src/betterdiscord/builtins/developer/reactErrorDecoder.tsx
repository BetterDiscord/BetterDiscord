import DiscordModules from "@modules/discordmodules";
import Builtin from "@structs/builtin";

const REACT_ERROR_CODES = `https://raw.githubusercontent.com/facebook/react/v${DiscordModules.React.version}/scripts/error-codes/codes.json`;

export default new class ReactErrorDecoder extends Builtin {
    get name() {return "ReactErrorDecoder";}
    get category() {return "developer";}
    get id() {return "reactErrorDecoder";}

    private errors = new Map<string, string>();

    async initialize() {
        this.patchErrorCodes();
        await this.fetchErrorCodes();
        return super.initialize();
    }

    private async fetchErrorCodes() {
        const res = await fetch(REACT_ERROR_CODES);
        const json = await res.json();
        this.errors = new Map(Object.entries(json));
        return json;
    }

    private patchErrorCodes() {
        this.after(DiscordModules.ReactConciler, "errorStack", (_, [e], __) => {
            return this.errors.get(String(e));
        });
    }

    async disabled() {
        this.unpatchAll();
    }
};