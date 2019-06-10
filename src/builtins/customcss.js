import Builtin from "../structs/builtin";
import {Settings, DataStore, React, Events} from "modules";
import CSSEditor from "../ui/customcss/editor";

const electron = require("electron");

export default new class CustomCSS extends Builtin {
    get name() {return "Custom CSS";}
    get category() {return "customcss";}
    get id() {return "customcss";}
    get startDetached() {return Settings.get(this.collection, this.category, "startDetached");}
    get nativeOpen() {return Settings.get(this.collection, this.category, "nativeOpen");}

    constructor() {
        super();
        this.css = "";
    }

    enabled() {
        Settings.registerPanel(this.id, this.name, {
            order: 2,
            element: () => React.createElement(CSSEditor, {
                css: this.css,
                save: this.saveCSS.bind(this),
                update: this.insertCSS.bind(this),
                openNative: this.openNative.bind(this)
            }),
            onClick: (thisObject) => {
                if (this.nativeOpen) this.openNative();
                else if (this.startDetached) this.openDetached();
                else thisObject._reactInternalFiber.child.memoizedProps.children.props.onSetSection(this.name);
            }
        });
        this.loadCSS();
        this.insertCSS();
    }

    disabled() {
        Settings.removePanel(this.id);
    }

    loadCSS() {
        this.css = DataStore.loadCustomCSS();
    }

    insertCSS(newCss) {
        if (typeof(newCss) === "undefined") newCss = this.css;
        if ($("#customcss").length == 0) {
            $("head").append("<style id=\"customcss\"></style>");
        }
        $("#customcss").text(newCss).detach().appendTo(document.head);
    }

    saveCSS(newCss) {
        if (typeof(newCss) !== "undefined") this.css = newCss;
        DataStore.saveCustomCSS(this.css);
    }

    openNative() {
        electron.shell.openExternal(`file://${DataStore.customCSS}`);
    }

    openDetached() {
        this.log("Should open detached");
    }
};