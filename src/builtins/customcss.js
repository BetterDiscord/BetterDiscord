import Builtin from "../structs/builtin";
import {Settings, DataStore, React, Utilities, WebpackModules} from "modules";
import CSSEditor from "../ui/customcss/editor";
import FloatingWindow from "../ui/customcss/detached";

import SettingsTitle from "../ui/settings/title";

const electron = require("electron");
const PopoutStack = WebpackModules.getByProps("open", "closeAll");
const PopoutOpener = WebpackModules.getByProps("openPopout");



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

    async enabled() {
        if (!window.ace) {
            Utilities.injectJs("https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js").then(() => {
                if (window.require.original) window.require = window.require.original;
            });
        }
        Settings.registerPanel(this.id, this.name, {
            order: 2,
            element: () => [<SettingsTitle text="Custom CSS Editor" />, React.createElement(CSSEditor, {
                css: this.css,
                save: this.saveCSS.bind(this),
                update: this.insertCSS.bind(this),
                openNative: this.openNative.bind(this),
                openDetached: this.openDetached.bind(this)
            })],
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
        PopoutStack.open({
            animationType: "none",
            arrowAlignment: "top",
            backdrop: false,
            closeOnScroll: false,
            key: this.id,
            forceTheme: "no-transform",
            position: "top",
            preventCloseFromModal: true,
            preventClickPropagation: true,
            preventCloseOnUnmount: true,
            preventInvert: false,
            render: (props) => {
                return React.createElement(FloatingWindow, Object.assign({}, props, {
                    close: () => {PopoutStack.close(this.id);},
                    isPopout: true,
                    title: "Custom CSS Editor",
                    className: "testme",
                    id: "test",
                    height: 400,
                    width: 500,
                    center: true
                }), React.createElement(CSSEditor, {
                    editorId: "bd-floating-editor",
                    css: this.css,
                    save: this.saveCSS.bind(this),
                    update: this.insertCSS.bind(this),
                    openNative: this.openNative.bind(this)
                }));
            },
            shadow: false,
            showArrow: false,
            zIndexBoost: 0
        });
    }
};

// const test = {
// animationType: "default",
// arrowAlignment: "top",
// backdrop: false,
// clickPos: 74,
// closeOnScroll: false,
// containerClass: undefined,
// dependsOn: undefined,
// forceTheme: undefined,
// key: "floating-window",
// offsetX: 15,
// offsetY: 0,
// position: "left",
// preventCloseFromModal: false,
// preventClickPropagation: true,
// preventInvert: false,
// render: function() {
//     console.log(arguments);
//     return DiscordModules.React.createElement("div", Object.assign({}, arguments[0], {className: "testme", id: "test"}));
// },
// shadow: false,
// showArrow: false,
// target: $("div.memberOnline-1CIh-0.member-3W1lQa.da-memberOnline.da-member")[0],
// targetHeight: 40,
// targetWidth: 224,
// x: 1211,
// y: 357,
// zIndexBoost: 0
// }