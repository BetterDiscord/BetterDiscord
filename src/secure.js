export default function() {
    const contentWindowGetter = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "contentWindow").get;
    Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
        get: function () {
            const contentWindow = Reflect.apply(contentWindowGetter, this, arguments);
            return new Proxy(contentWindow, {
                getOwnPropertyDescriptor: function(obj, prop) {
                    if (prop === "localStorage") return undefined;
                    return Object.getOwnPropertyDescriptor(obj, prop);
                },
                get: function(obj, prop) {
                    if (prop === "localStorage") return null;
                    const val = obj[prop];
                    if (typeof val === "function") return val.bind(obj);
                    return val;
                }
            });
        }
    });

    // Prevent interception by patching Reflect.apply and Function.prototype.bind
    Object.defineProperty(Reflect, "apply", {value: Reflect.apply, writable: false, configurable: false});
    Object.defineProperty(Function.prototype, "bind", {value: Function.prototype.bind, writable: false, configurable: false});

    const oOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        const url = arguments[1];
        if (url.toLowerCase().includes("api/webhooks")) return null;
        return Reflect.apply(oOpen, this, arguments);
    };
}