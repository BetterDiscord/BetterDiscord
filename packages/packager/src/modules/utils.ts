export const Decoder = new TextDecoder();
export const Encoder = new TextEncoder();

export const panic = (message: any) => {throw "PANIC: " + message;};

export const concatBuffers = (list: (Buffer | Uint8Array)[], length?: number) => {
    if (typeof(length) === "undefined") {
        length = 0;
        for (const item of list) {
            if (!item.length) continue;
            length += item.length;
        }
    }

    const buffer = new Uint8Array(length);
    let pos = 0;

    for (const item of list) {
        buffer.set(item, pos);
        pos += item.length;
    }

    return buffer;
}
