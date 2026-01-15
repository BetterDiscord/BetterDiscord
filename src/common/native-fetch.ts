export interface DriedAbortSignal {
    aborted(): boolean;
    reason(): any;
    addListener(listener: () => void): () => void;
}

export interface DryReadableStream {
    read(): Promise<ReadableStreamReadResult<Uint8Array<ArrayBuffer>>>;
    cancel(reason?: any): Promise<void>;
}

export type NativeRequestMethod = "GET" | "PUT" | "POST" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";

export interface NativeRequestInit {
    body?: BodyInit | null;
    headers?: HeadersInit;
    keepalive?: boolean;
    method?: NativeRequestMethod;
    redirect?: RequestRedirect;
    signal?: AbortSignal | null;

    // Custom
    timeout?: number;
    maxRedirects?: number;
    rejectUnauthorized?: boolean;
}

export interface DriedRequest {
    url: string;
    body: DryReadableStream | null;
    headers: Record<string, string>;
    keepalive: boolean;
    method: NativeRequestMethod;
    redirect: RequestRedirect;
    signal: DriedAbortSignal | null;

    // Custom
    timeout: number | null | undefined;
    maxRedirects: number;
    rejectUnauthorized: boolean;
}

export interface DriedResponse {
    body: DryReadableStream | null;
    url: string;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    redirected: boolean;
}

export function dryReadableStream(stream: ReadableStream<Uint8Array<ArrayBuffer>>): DryReadableStream {
    // If type is not "bytes" throw error
    const $stream = new Response(stream).body!;

    const reader = $stream.getReader();

    return {
        // Bun hijacks the type
        read: () => reader.read() as Promise<ReadableStreamReadResult<Uint8Array<ArrayBuffer>>>,
        cancel: () => reader.cancel()
    };
}

export function hydrateReadableStream(stream: DryReadableStream): ReadableStream<Uint8Array<ArrayBuffer>> {
    return new ReadableStream({
        async start(controller) {
            while (true) {
                const {
                    done, value
                } = await stream.read();

                if (done) {
                    controller.close();
                    break;
                }
                else {
                    controller.enqueue(value);
                }
            }
        },
        type: "bytes"
    });
}
