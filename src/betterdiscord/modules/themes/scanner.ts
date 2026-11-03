/**
 * A small CSS scanner that reads a theme's source one character at a time. It finds every `@property` rule and
 * every custom property declaration, along with the rules that enclose them. It tracks strings, comments,
 * `url()`, parentheses and braces, so a `;` or `}` inside any of those never ends a rule early.
 *
 * It reads the source text instead of the browser's CSSOM because Chromium drops descriptors it doesn't know,
 * such as `name` and `note`.
 */

/** A rule that encloses a scanned item, from the outermost in. */
export type ScanContext =
    | {kind: "at-rule"; name: string; prelude: string;}
    | {kind: "style"; selector: string;};

export interface ScannedPropertyRule {
    /** The custom property name, `--x`. */
    property: string;

    /** Descriptor names in lower case, mapped to their raw values with comments removed. A repeated descriptor keeps its last value. */
    descriptors: Record<string, string>;

    line: number;
    context: ScanContext[];
}

export interface ScannedDeclaration {
    /** The custom property name, `--x`. */
    property: string;

    /** The raw value with comments and `!important` removed. */
    value: string;

    important: boolean;
    line: number;
    context: ScanContext[];
}

export interface ScanResult {
    properties: ScannedPropertyRule[];
    declarations: ScannedDeclaration[];
}

const enum Char {
    Tab = 9,
    LineFeed = 10,
    FormFeed = 12,
    CarriageReturn = 13,
    Space = 32,
    Exclamation = 33,
    DoubleQuote = 34,
    SingleQuote = 39,
    OpenParenthesis = 40,
    CloseParenthesis = 41,
    Asterisk = 42,
    Slash = 47,
    Colon = 58,
    Semicolon = 59,
    At = 64,
    OpenBracket = 91,
    Backslash = 92,
    CloseBracket = 93,
    OpenBrace = 123,
    CloseBrace = 125
}

/** Where `readUntil` stopped: at one of its stop characters, or at the end of the source. */
type Stop = Char.OpenBrace | Char.CloseBrace | Char.Semicolon | null;

interface ReadResult {
    /** The text read, with comments removed. */
    text: string;

    /** The index of the stop character, or the source length. */
    end: number;

    stop: Stop;
}

function isWhitespace(code: number) {
    return code === Char.Space || code === Char.Tab || code === Char.LineFeed || code === Char.CarriageReturn || code === Char.FormFeed;
}

class Scanner {
    readonly source: string;
    readonly result: ScanResult = {properties: [], declarations: []};
    private readonly lineStarts: number[] = [0];

    constructor(source: string) {
        this.source = source;
        for (let i = 0; i < source.length; i++) {
            if (source.charCodeAt(i) === Char.LineFeed) this.lineStarts.push(i + 1);
        }
    }

    /** The 1-based line that holds `index`. */
    lineAt(index: number) {
        let low = 0;
        let high = this.lineStarts.length - 1;
        while (low < high) {
            const mid = (low + high + 1) >> 1;
            if (this.lineStarts[mid] <= index) low = mid;
            else high = mid - 1;
        }
        return low + 1;
    }

    /** The index after the comment that starts at `index`, or the source length when it never closes. */
    skipComment(index: number) {
        const end = this.source.indexOf("*/", index + 2);
        return end === -1 ? this.source.length : end + 2;
    }

    /** Skips whitespace and comments, and returns the index of the next real character. */
    skipBlank(index: number) {
        while (index < this.source.length) {
            const code = this.source.charCodeAt(index);
            if (isWhitespace(code)) index++;
            else if (this.isCommentStart(index)) index = this.skipComment(index);
            else break;
        }
        return index;
    }

    isCommentStart(index: number) {
        return this.source.charCodeAt(index) === Char.Slash && this.source.charCodeAt(index + 1) === Char.Asterisk;
    }

    /**
     * The index of the closing quote of the string that opens at `index`. Like the browser, an unescaped line
     * break also ends the string, so a stray quote can't swallow the rest of the file.
     */
    findEndOfString(index: number) {
        const quote = this.source.charCodeAt(index);
        for (let i = index + 1; i < this.source.length; i++) {
            const code = this.source.charCodeAt(i);
            if (code === Char.Backslash) i++;
            else if (code === quote || code === Char.LineFeed) return i;
        }
        return this.source.length;
    }

    /**
     * When an unquoted `url(` starts at `index`, returns the index of its closing parenthesis. An unquoted URL
     * may hold `;`, `{` and `}`, as in a data URI. Returns -1 when there's no unquoted `url(` here.
     */
    findEndOfUnquotedUrl(index: number) {
        if (this.source.slice(index, index + 4).toLowerCase() !== "url(") return -1;

        // `url` must start a token, so `myurl(` is just a function
        const before = this.source.charCodeAt(index - 1);
        if (index > 0 && /[\w-]/.test(String.fromCharCode(before))) return -1;

        const start = this.skipWhitespaceOnly(index + 4);
        const first = this.source.charCodeAt(start);
        if (first === Char.DoubleQuote || first === Char.SingleQuote) return -1;

        for (let i = start; i < this.source.length; i++) {
            const code = this.source.charCodeAt(i);
            if (code === Char.Backslash) i++;
            else if (code === Char.CloseParenthesis) return i;
        }
        return this.source.length;
    }

    skipWhitespaceOnly(index: number) {
        while (index < this.source.length && isWhitespace(this.source.charCodeAt(index))) index++;
        return index;
    }

    /**
     * Reads from `index` until a stop character outside any string, comment, `url()` or parentheses, and drops
     * the comments from the text. With `nestBraces`, a `{` opens a block whose `}` doesn't stop the read,
     * which a custom property's value needs.
     */
    readUntil(index: number, stops: Stop[], nestBraces = false): ReadResult {
        let text = "";
        let segmentStart = index;
        let depth = 0;
        let braceDepth = 0;

        let i = index;
        while (i < this.source.length) {
            const code = this.source.charCodeAt(i);

            if (this.isCommentStart(i)) {
                text += this.source.slice(segmentStart, i);
                i = this.skipComment(i);
                segmentStart = i;
                continue;
            }

            if (code === Char.DoubleQuote || code === Char.SingleQuote) {
                i = this.findEndOfString(i) + 1;
                continue;
            }

            const urlEnd = this.findEndOfUnquotedUrl(i);
            if (urlEnd !== -1) {
                i = urlEnd + 1;
                continue;
            }

            if (code === Char.Backslash) {
                i += 2;
                continue;
            }

            if (code === Char.OpenParenthesis || code === Char.OpenBracket) {
                depth++;
            }
            else if (code === Char.CloseParenthesis || code === Char.CloseBracket) {
                depth = Math.max(0, depth - 1);
            }
            else if (depth === 0) {
                if (nestBraces && code === Char.OpenBrace) {
                    braceDepth++;
                }
                else if (nestBraces && code === Char.CloseBrace && braceDepth > 0) {
                    braceDepth--;
                }
                else if (braceDepth === 0 && (stops as number[]).includes(code)) {
                    text += this.source.slice(segmentStart, i);
                    return {text, end: i, stop: code as Stop};
                }
            }

            i++;
        }

        text += this.source.slice(segmentStart, i);
        return {text, end: this.source.length, stop: null};
    }

    /**
     * Reads the contents of a block, or of the whole sheet when `context` is empty, and returns the index after
     * its closing `}`.
     */
    readBlock(index: number, context: ScanContext[]): number {
        const isTopLevel = context.length === 0;

        while (index < this.source.length) {
            index = this.skipBlank(index);
            if (index >= this.source.length) return index;

            const code = this.source.charCodeAt(index);

            if (code === Char.CloseBrace) {
                // A stray `}` at the top level is skipped, the same as the browser does
                if (isTopLevel) {
                    index++;
                    continue;
                }
                return index + 1;
            }

            if (code === Char.Semicolon) {
                index++;
                continue;
            }

            if (code === Char.At) {
                index = this.readAtRule(index, context);
                continue;
            }

            index = this.readRuleOrDeclaration(index, context);
        }

        return index;
    }

    readAtRule(index: number, context: ScanContext[]) {
        const start = index;
        const nameMatch = /^@([\w-]+)/.exec(this.source.slice(index, index + 64));
        const name = (nameMatch?.[1] ?? "").toLowerCase();
        index += 1 + (nameMatch?.[1].length ?? 0);

        const prelude = this.readUntil(index, [Char.OpenBrace, Char.Semicolon, Char.CloseBrace]);
        if (prelude.stop !== Char.OpenBrace) {
            // A statement at-rule such as `@import`, or a broken one. A `}` belongs to the enclosing block.
            return prelude.stop === Char.Semicolon ? prelude.end + 1 : prelude.end;
        }

        if (name === "property") return this.readPropertyRule(start, prelude.text.trim(), prelude.end + 1, context);

        return this.readBlock(prelude.end + 1, [...context, {kind: "at-rule", name, prelude: prelude.text.trim()}]);
    }

    readPropertyRule(start: number, property: string, index: number, context: ScanContext[]) {
        const descriptors: Record<string, string> = {};

        while (index < this.source.length) {
            const item = this.readUntil(index, [Char.Semicolon, Char.CloseBrace]);
            const colon = item.text.indexOf(":");
            if (colon !== -1) {
                const descriptor = item.text.slice(0, colon).trim().toLowerCase();
                if (descriptor) descriptors[descriptor] = item.text.slice(colon + 1).trim();
            }

            index = item.end + 1;
            if (item.stop !== Char.Semicolon) break;
        }

        this.result.properties.push({property, descriptors, line: this.lineAt(start), context});
        return index;
    }

    /**
     * Reads either a style rule or a declaration. Which one it is only shows at the first `{`, `;` or `}`,
     * except that a custom property declaration may hold braces in its value.
     */
    readRuleOrDeclaration(index: number, context: ScanContext[]) {
        const customProperty = /^--[^\s:;{}]*\s*:/.exec(this.source.slice(index, index + 256));
        if (customProperty) {
            const value = this.readUntil(index + customProperty[0].length, [Char.Semicolon, Char.CloseBrace], true);
            if (context.length) this.addDeclaration(index, customProperty[0].slice(0, -1).trim(), value.text, context);
            return value.stop === Char.Semicolon ? value.end + 1 : value.end;
        }

        const item = this.readUntil(index, [Char.OpenBrace, Char.Semicolon, Char.CloseBrace]);
        if (item.stop === Char.OpenBrace) {
            return this.readBlock(item.end + 1, [...context, {kind: "style", selector: item.text.trim()}]);
        }

        // An ordinary declaration, which the scanner has no use for. A `}` belongs to the enclosing block.
        return item.stop === Char.Semicolon ? item.end + 1 : item.end;
    }

    addDeclaration(start: number, property: string, rawValue: string, context: ScanContext[]) {
        let value = rawValue.trim();
        const important = /!\s*important$/i.exec(value);
        if (important) value = value.slice(0, important.index).trim();

        this.result.declarations.push({property, value, important: Boolean(important), line: this.lineAt(start), context});
    }
}

/** Scans a theme's source for its `@property` rules and custom property declarations. */
export function scanCss(source: string): ScanResult {
    const scanner = new Scanner(source);
    scanner.readBlock(0, []);
    return scanner.result;
}

/**
 * Reads a CSS string token such as `"Accent \"color\""` and returns its contents with the escapes resolved.
 * Returns null when `raw` isn't one complete string.
 */
export function parseCssString(raw: string): string | null {
    const quote = raw.charCodeAt(0);
    if (raw.length < 2 || (quote !== Char.DoubleQuote && quote !== Char.SingleQuote)) return null;

    let out = "";
    for (let i = 1; i < raw.length; i++) {
        const code = raw.charCodeAt(i);

        if (code === quote) return i === raw.length - 1 ? out : null;
        if (code === Char.LineFeed) return null;

        if (code === Char.Backslash) {
            const next = raw[i + 1];
            if (next === undefined) return null;

            // An escaped line break continues the string without adding anything
            if (next === "\n") {
                i++;
                continue;
            }

            // A hex escape is up to six hex digits, optionally followed by one whitespace character
            const hex = /^[0-9a-fA-F]{1,6}/.exec(raw.slice(i + 1, i + 7));
            if (hex) {
                const codePoint = parseInt(hex[0], 16);
                const isValid = codePoint !== 0 && codePoint <= 0x10FFFF && (codePoint < 0xD800 || codePoint > 0xDFFF);
                out += isValid ? String.fromCodePoint(codePoint) : "�";
                i += hex[0].length;
                if (isWhitespace(raw.charCodeAt(i + 1))) i++;
                continue;
            }

            out += next;
            i++;
            continue;
        }

        out += raw[i];
    }

    return null;
}

/**
 * Splits `text` on `separator` wherever it sits outside strings, `url()` and parentheses, and trims each part.
 * `rgb(1, 2, 3), #fff` split on `,` gives two parts.
 */
export function splitTopLevel(text: string, separator: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === "\"" || char === "'") {
            for (i++; i < text.length && text[i] !== char; i++) {
                if (text[i] === "\\") i++;
            }
        }
        else if (char === "\\") {
            i++;
        }
        else if (char === "(" || char === "[") {
            depth++;
        }
        else if (char === ")" || char === "]") {
            depth = Math.max(0, depth - 1);
        }
        else if (depth === 0 && char === separator) {
            parts.push(text.slice(start, i).trim());
            start = i + 1;
        }
    }

    parts.push(text.slice(start).trim());
    return parts;
}
