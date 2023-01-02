import fs from "fs";
import path from "path";
import Bundle, {ArchiveEntry} from "./modules/bundle";
import {Decoder, Encoder, concatBuffers, panic} from "./modules/utils";

export const pattern = [0x539, 0x45];

export const extractContents = (input: Buffer | Uint8Array) => {
    const view = new DataView(input.buffer);

    if (view.getUint32(0) !== pattern[0] || view.getUint32(4) !== pattern[1]) {
        throw "Not a valid BD package. (pattern does not match)";
    }

    const headLength = view.getUint32(8);
    const header = Decoder.decode(input.slice(0x10, 0x10 + headLength).buffer);
    
    const head = JSON.parse(header);

    return new Bundle(input.slice(0x10), head, headLength);
};

export const create = (location: string) => {
    if (!fs.existsSync(location)) return null;
    
    const bundle = (sub: string, list: ArchiveEntry, {files = [] as Buffer[], offset = 0} = {}): [Buffer[], ArchiveEntry, number] | undefined => {
        const stats = fs.statSync(sub);

        if (stats.isFile()) {
            const content = fs.readFileSync(sub);

            files.push(content);
            
            list.files[path.basename(sub)] = {
                size: String(content.length),
                offset: String(offset)
            }

            offset += content.length;

            return [files, list, offset];
        }

        if (stats.isDirectory()) {
            if (sub !== location) {
                list = (<ArchiveEntry["files"]><unknown>list)[path.basename(sub)] = {files: {}};
            }

            for (const file of fs.readdirSync(sub, {withFileTypes: true})) {
                const [, , newOffset] = bundle(path.join(sub, file.name), list, {
                    files,
                    offset
                }) as [never, never, number];

                offset = newOffset;
            }

            return [files, list, offset];
        }

        panic(`Unknown dirent ${sub}`);
    };
    
    const head = {files: {}};
    const [files] = bundle(location, head) as Array<Buffer[]>;
    const headerBuf = Encoder.encode(JSON.stringify(head));
    const fileBuf = concatBuffers(files.flat());
    const buffer = new Uint8Array(0x10);
    const view = new DataView(buffer.buffer);

    view.setUint32(0, pattern[0]);
    view.setUint32(4, pattern[1]);
    view.setUint32(8, headerBuf.length);

    return concatBuffers([
        buffer,
        headerBuf,
        fileBuf
    ]);
};
