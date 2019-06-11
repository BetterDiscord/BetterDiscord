import Builtin from "../structs/builtin";
import {Settings, DataStore, React, Utilities} from "modules";
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

    async enabled() {
        if (!window.ace) {
            Utilities.injectJs("https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js").then(() => {
                if (window.require.original) window.require = window.require.original;
            });
        }
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
        const options = {
            width: 500,
            height: 550,
            backgroundColor: "#282b30",
            show: true,
            resizable: false,
            maximizable: false,
            minimizable: false,
            alwaysOnTop: true,
            frame: true,
            center: false,
            webPreferences: {
                nodeIntegration: true
            }
        };

        const detached = new electron.remote.Browserdetached(options);
        detached.setMenu(null);
        detached.loadURL("about:blank");
        detached.webContents.executeJavaScript(`var electron = require("electron");`);
        detached.webContents.executeJavaScript(`var sender, receiver = electron.ipcRenderer;`);
        detached.webContents.executeJavaScript(`receiver.on("bd-handshake", function(emitter, senderID) {
            console.log(arguments);
            sender = electron.remote.BrowserWindow.fromId(senderID);
            receiver.removeAllListeners("bd-handshake");
        });`);
        detached.send("bd-handshake", electron.remote.getCurrentWindow().id);
        React.createElement(CSSEditor, {
            css: this.css,
            save: this.saveCSS.bind(this),
            update: this.insertCSS.bind(this),
            openNative: this.openNative.bind(this)
        });
    }
};

// function addListeners(){
//     document.getElementById('test').addEventListener('mousedown', mouseDown, false);
//     window.addEventListener('mouseup', mouseUp, false);

// }

// function mouseUp()
// {
//     window.removeEventListener('mousemove', divMove, true);
// }

// function mouseDown(e){
//   var div = document.getElementById('test');
//   offY= e.clientY-parseInt(div.offsetTop);
//   offX= e.clientX-parseInt(div.offsetLeft);
//  window.addEventListener('mousemove', divMove, true);
// }

// function divMove(e){
//     var div = document.getElementById('test');
//   div.style.position = 'absolute';
//   div.style.top = (e.clientY-offY) + 'px';
//   div.style.left = (e.clientX-offX) + 'px';
// }