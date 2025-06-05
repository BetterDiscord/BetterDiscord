import Builtin from "@structs/builtin";

import RemoteAPI from "@polyfill/remote";

export default new class StopDevToolsWarning extends Builtin {
    get name() {return "StopDevToolsWarning";}
    get category() {return "developer";}
    get id() {return "devToolsWarning";}

    async enabled() {
        RemoteAPI.setDevToolsWarningState(true);
    }

    async disabled() {
        RemoteAPI.setDevToolsWarningState(false);
    }
};