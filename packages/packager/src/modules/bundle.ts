import {Decoder} from "./utils";

export type ArchiveFile = {
    size: string,
    offset: string
};

export type ArchiveEntry = {
    files: {[key: string]: ArchiveEntry | ArchiveFile}
};

export type ArchiveHeader = {
    files: ArchiveEntry
};

export default class Bundle {
    buffer: Buffer | Uint8Array;
    offsets: ArchiveEntry;
    bodyOffset = 0;

    constructor(buf: Buffer | Uint8Array, header: ArchiveEntry, bodyOffset: number) {
        this.bodyOffset = bodyOffset;
        this.offsets = header;
        this.buffer = buf;
    }

    readDir(dest: string, raw?: false): string[];
    readDir(dest: string, raw?: true): ArchiveEntry["files"];
    readDir(dest = "", raw?: boolean): ArchiveEntry["files"] | string[] {
        const split = dest.split(/\\|\//);
        let current = this.offsets.files;

        if (split.length > 1) for (const item of split) {
            if (!current) throw "No such file or directory.";
            if (item === ".") continue;

            const keys = Object.keys(current);
            const target = keys.find(k => k.toLowerCase() === item.toLowerCase());

            if (!target || !(<ArchiveEntry>current[target]).files) throw "ENOENT";

            current = (<ArchiveEntry>current[target]).files;
        }

        return raw ? current : Object.keys(current);
    }

    readFile(dest = "", string?: boolean) {
        const split = dest.split(/\\|\//);
        const last = <string>split.pop();
        const file = <ArchiveFile>this.readDir(split.join("/"), true)[last];

        if (!file) throw "No such file found.";

        const offset = this.bodyOffset + Number(file.offset);

        return string
            ? Decoder.decode(this.buffer.subarray(offset, offset + Number(file.size)).buffer)
            : this.buffer.subarray(offset, offset + Number(file.size));
    }

    hasFile(dest: string) {
        return !!this.readFile(dest);
    }
}
