export default function () {
    const contentWindowGetter = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "contentWindow")!.get!;
    Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
        get: function (...args: any[]) {
            const contentWindow = Reflect.apply(contentWindowGetter, this, args);
            return new Proxy(contentWindow, {
                getOwnPropertyDescriptor: function (obj, prop) {
                    if (prop === "localStorage") return undefined;
                    return Object.getOwnPropertyDescriptor(obj, prop);
                },
                get: function (obj, prop) {
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

    const isWebhookURL = (url: unknown): boolean => typeof url === "string" && url.toLowerCase().includes("api/webhooks");

    const oOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args: any[]) {
        if (isWebhookURL(args[1])) return null;
        return Reflect.apply(oOpen, this, args);
    };

    const oFetch = window.fetch;
    window.fetch = function (this: typeof window, input: RequestInfo | URL, _init?: RequestInit) {
        const url = input instanceof Request ? input.url : String(input);
        if (isWebhookURL(url)) return Promise.reject(new TypeError("Failed to fetch"));
        // eslint-disable-next-line prefer-rest-params
        return Reflect.apply(oFetch, this, arguments);
    };
}