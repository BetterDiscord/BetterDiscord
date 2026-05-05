const splitRegex = /[^\S\r\n]*?\r?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/;
const escapedAtRegex = /^\\@/;

export default function parseJsDoc(text: string) {
    const block = text.split("/**", 2)[1].split("*/", 1)[0];
    const out: Record<string, string | string[]> = {};
    let field = "";
    let accum = "";
    for (const line of block.split(splitRegex)) {
        if (line.length === 0) continue;
        if (line.charAt(0) === "@" && line.charAt(1) !== " ") {
            if (!out[field]) {
                out[field] = accum.trim();
            }
            else {
                if (!Array.isArray(out[field])) out[field] = [out[field] as string];
                (out[field] as string[]).push(accum.trim());
            }
            const l = line.indexOf(" ");
            field = line.substring(1, l);
            accum = line.substring(l + 1);
        }
        else {
            accum += " " + line.replace("\\n", "\n").replace(escapedAtRegex, "@");
        }
    }
    if (!out[field]) {
        out[field] = accum.trim();
    }
    else {
        if (!Array.isArray(out[field])) out[field] = [out[field] as string];
        (out[field] as string[]).push(accum.trim());
    }
    delete out[""];
    out.format = "jsdoc";
    return out;
}