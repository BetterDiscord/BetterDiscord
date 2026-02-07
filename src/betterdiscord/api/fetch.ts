import {dryReadableStream, hydrateReadableStream, type DriedAbortSignal, type DriedResponse, type NativeRequestInit, type NativeRequestMethod} from "@common/native-fetch.ts";
import Remote from "../polyfill/remote";

const MAX_DEFAULT_REDIRECTS = 20;
const DEFAULT_TIMEOUT = 3000;
const methods = new Set(["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS", "HEAD", "CONNECT", "TRACE"]);

function dryAbortSignal(signal: AbortSignal): DriedAbortSignal {
    return {
        aborted: () => signal.aborted,
        reason: () => signal.reason,
        addListener: (onAbort) => {
            if (signal.aborted) {
                try {
                    onAbort();
                }
                finally {
                    // eslint-disable-next-line no-unsafe-finally
                    return () => {};
                }
            }

            const listener = () => onAbort();
            signal.addEventListener("abort", listener, {once: true});
            return () => void signal.removeEventListener("abort", listener);
        }
    };
}

class HydratingResponse extends Response {
    #dried;

    constructor(dried: DriedResponse) {
        super(dried.body ? hydrateReadableStream(dried.body) : null, {
            headers: dried.headers,
            status: dried.status,
            statusText: dried.statusText
        });

        this.#dried = dried;
    }

    override get url() {
        return this.#dried.url;
    }
    override get redirected() {
        return this.#dried.redirected;
    }
}

async function fetch(input: string | URL | Request, init?: NativeRequestInit): Promise<Response> {
    let request: Request;
    if (input instanceof Request) {
        request = input;
    }
    else if (input instanceof URL) {
        request = new Request(input.href, init);
    }
    else {
        request = new Request(input, init);
    }

    const driedResponse = await Remote.nativeFetch({
        url: request.url,

        body: request.body ? dryReadableStream(request.body) : null,

        headers: Object.fromEntries(request.headers),

        keepalive: request.keepalive,
        method: methods.has(request.method) ? request.method as NativeRequestMethod : "GET",
        redirect: request.redirect,
        signal: request.signal ? dryAbortSignal(request.signal) : null,

        timeout: init?.timeout ?? DEFAULT_TIMEOUT,
        maxRedirects: init?.maxRedirects ?? MAX_DEFAULT_REDIRECTS,
        rejectUnauthorized: init?.rejectUnauthorized ?? true
    });

    return new HydratingResponse(driedResponse);
}

export default fetch;