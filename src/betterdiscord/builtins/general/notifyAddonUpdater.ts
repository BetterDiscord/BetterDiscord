import Builtin from "@structs/builtin";

export default new class NotifyAddonUpdate extends Builtin {
    get name() {return "NotifyAddonUpdate";}
    get category() {return "developer";}
    get id() {return "notifyAddonUpdate";}
};