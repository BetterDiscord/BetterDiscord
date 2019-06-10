import Builtin from "../structs/builtin";
import {Settings} from "modules";
import CSSEditor from "../ui/customcss/editor";

export default new class CustomCSS extends Builtin {
    get name() {return "Custom CSS";}
    get category() {return "customcss";}
    get id() {return "customcss";}

    enabled() {
        Settings.registerPanel(this.id, this.name, {
            element: CSSEditor,
            order: 2
        });
    }

    disabled() {
        Settings.removePanel(this.id);
    }
};