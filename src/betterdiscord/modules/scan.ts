/**
 * Import/export scanner for JavaScript modules. Tokenizes once, so strings, comments, regex
 * and template text are ignored. Not a full parser: JSX text containing `import(` can match.
 */

export type ImportKind = "default" | "namespace" | "named";
export type AttributesKeyword = "with" | "assert";
export type DeclarationKind = "function" | "class" | "const" | "let" | "var" | "expression";

export interface Location {
    /** 1-based */
    line: number;
    /** 0-based */
    column: number;
    /** Offset of the `import` / `export` keyword */
    start: number;
    /** Offset after the statement / call (excludes `;`; exports follow ASI) */
    end: number;
}

export interface ImportSpecifier {
    kind: ImportKind;
    /** `"default"`, `"*"`, or the exported key */
    imported: string;
    /** Local binding name (null if accessed but not bound, e.g. `(await import("x")).foo`) */
    local: string | null;
}

interface ImportBase extends Location {
    /** Empty = side-effect import (static) or unknown usage (dynamic) */
    specifiers: ImportSpecifier[];
    /**
     * `with { type: "bytes" }` → `{ type: "bytes" }`. For dynamic imports, read from the options
     * object's `with` / `assert`. Non-literal values are skipped.
     */
    attributes: Record<string, string> | null;
    attributesKeyword: AttributesKeyword | null;
}

export interface StaticImport extends ImportBase {
    /** Text between the quotes as written (escapes aren't decoded) */
    source: string;
    dynamic: false;
}

export interface DynamicImport extends ImportBase {
    /** null when the argument isn't a string literal (see `expression`) */
    source: string | null;
    dynamic: true;
    /** Raw argument text when the argument isn't a string literal */
    expression?: string;
}

export type ImportInfo = StaticImport | DynamicImport;

/**
 * `exported` is the name it's exported as. `local` is the local binding, or the source module's
 * key for re-exports.
 * - `named`: `export { a as b }`, `export const b = 1`, `export { a as b } from "x"`
 * - `default`: `export default ...`, `export { a as default }` (`local` is null for an anonymous
 *   function / class or an expression other than a plain identifier)
 * - `namespace`: `export * as ns from "x"`
 * - `all`: `export * from "x"`
 */
export type ExportSpecifier =
    | {kind: "named"; exported: string; local: string;}
    | {kind: "default"; exported: "default"; local: string | null;}
    | {kind: "namespace"; exported: string; local: "*";}
    | {kind: "all"; exported: null; local: "*";};

export type ExportKind = ExportSpecifier["kind"];

export interface ExportInfo extends Location {
    /** Set for re-exports (`export ... from "x"`) */
    source: string | null;
    /** What follows `export` / `export default` (null for `export { }` lists and `export *`) */
    declaration: DeclarationKind | null;
    /**
     * Offset where that declaration / default expression starts, i.e. `export` / `export default`
     * stripped off (null when `declaration` is null)
     */
    declarationStart: number | null;
    specifiers: ExportSpecifier[];
    /** Re-export attributes (`export * from "x" with { type: "json" }`) */
    attributes: Record<string, string> | null;
    attributesKeyword: AttributesKeyword | null;
}

/** An `import.meta` occurrence. `start`–`end` covers just `import.meta`, not the property after it. */
export interface ImportMetaInfo extends Location {
    /**
     * Property read right after it, e.g. `"url"` for `import.meta.url` or `"resolve"` for
     * `import.meta.resolve(...)` (null for bare `import.meta` or computed access like `import.meta[x]`)
     */
    property: string | null;
}

export interface ModuleScan {
    imports: ImportInfo[];
    exports: ExportInfo[];
    importMeta: ImportMetaInfo[];
}

// ---------------------------------------------------------------------------
// Tokenizer

interface BaseToken {
    value: string;
    start: number;
    end: number;
    /** Line break between the previous token and this one (for ASI) */
    nl: boolean;
}
interface PlainToken extends BaseToken {
    type: "name" | "str" | "num" | "regex" | "punct";
}
interface TemplateToken extends BaseToken {
    type: "tpl";
    /** Chunk starts with a backtick (otherwise it follows a `}`) */
    head: boolean;
    /** Chunk ends with a backtick (otherwise it ends at `${`) */
    tail: boolean;
}
type Token = PlainToken | TemplateToken;

const KEYWORDS_BEFORE_EXPR = new Set([
    "return", "typeof", "instanceof", "in", "of", "new", "delete", "void",
    "throw", "case", "do", "else", "yield", "await", "extends",
]);
const NAME = /[$_\p{ID_Start}][$‌‍\p{ID_Continue}]*/uy;
const NUMBER = /(?:\d|\.\d)[\w.]*/y;
const PUNCT = /\.\.\.|\?\.(?!\d)|=>|[=!]==?|[<>]=|&&=?|\|\|=?|\?\?=?|\*\*=?|\+\+|--|<<=?|>>>?=?|[-+*%&|^/]=|[^]/y;

function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    const braces: Array<"{" | "tpl"> = []; // "tpl" for `${`
    const n = code.length;
    let i = 0;
    let nl = false;

    const push = (type: PlainToken["type"], value: string, start: number, end: number): void => {
        tokens.push({type, value, start, end, nl});
        nl = false;
    };

    const regexAllowed = (): boolean => {
        const t = tokens[tokens.length - 1] as Token | undefined;
        if (!t) return true;
        if (t.type === "name") return KEYWORDS_BEFORE_EXPR.has(t.value);
        if (t.type === "punct") return t.value !== ")" && t.value !== "]" && t.value !== "}";
        if (t.type === "tpl") return !t.tail; // right after `${`
        return false;
    };

    const readTemplate = (from: number, head: boolean): number => {
        let j = from;
        let tail = true;
        for (; j < n; j++) {
            const c = code[j];
            if (c === "\\") {j++; continue;}
            if (c === "`") break;
            if (c === "$" && code[j + 1] === "{") {tail = false; break;}
        }
        const end = j >= n ? n : tail ? j + 1 : j + 2;
        tokens.push({type: "tpl", value: code.slice(from, Math.min(j, n)), start: from - 1, end, head, tail, nl});
        nl = false;
        if (!tail) braces.push("tpl");
        return end;
    };

    while (i < n) {
        const c = code[i];
        const cc = code.charCodeAt(i);

        // whitespace
        if (cc === 10 || cc === 13 || cc === 0x2028 || cc === 0x2029) {nl = true; i++; continue;}
        if (cc === 32 || (cc >= 9 && cc <= 12) || cc === 0xa0 || cc === 0xfeff) {i++; continue;}

        // comments / hashbang
        if ((c === "/" && code[i + 1] === "/") || (i === 0 && c === "#" && code[1] === "!")) {
            const e = code.indexOf("\n", i);
            i = e < 0 ? n : e;
            continue;
        }
        if (c === "/" && code[i + 1] === "*") {
            const e = code.indexOf("*/", i + 2);
            const end = e < 0 ? n : e + 2;
            if (!nl && code.slice(i, end).includes("\n")) nl = true;
            i = end;
            continue;
        }

        // strings (an unterminated one on its line is treated as a stray quote, e.g. JSX text "don't")
        if (c === "\"" || c === "'") {
            let j = i + 1;
            while (j < n && code[j] !== c && code[j] !== "\n") j += code[j] === "\\" ? 2 : 1;
            if (code[j] === c) {
                push("str", code.slice(i + 1, j), i, j + 1);
                i = j + 1;
            }
            else {
                push("punct", c, i, i + 1);
                i++;
            }
            continue;
        }

        if (c === "`") {i = readTemplate(i + 1, true); continue;}

        if (c === "{") {
            braces.push("{");
            push("punct", c, i, i + 1);
            i++;
            continue;
        }
        if (c === "}") {
            if (braces.pop() === "tpl") {i = readTemplate(i + 1, false); continue;}
            push("punct", c, i, i + 1);
            i++;
            continue;
        }

        // numbers
        if ((c >= "0" && c <= "9") || (c === "." && code[i + 1] >= "0" && code[i + 1] <= "9")) {
            NUMBER.lastIndex = i;
            NUMBER.test(code);
            push("num", code.slice(i, NUMBER.lastIndex), i, NUMBER.lastIndex);
            i = NUMBER.lastIndex;
            continue;
        }

        // identifiers / keywords
        NAME.lastIndex = i;
        const name = NAME.exec(code);
        if (name) {
            push("name", name[0], i, NAME.lastIndex);
            i = NAME.lastIndex;
            continue;
        }

        // regex literals
        if (c === "/" && regexAllowed()) {
            let j = i + 1;
            let inClass = false;
            for (; j < n; j++) {
                const d = code[j];
                if (d === "\\") {j++; continue;}
                if (d === "\n") break;
                if (inClass) {if (d === "]") inClass = false;}
                else if (d === "[") {inClass = true;}
                else if (d === "/") {break;}
            }
            if (code[j] === "/") {
                j++;
                while (j < n && /[a-z]/i.test(code[j])) j++;
                push("regex", code.slice(i, j), i, j);
                i = j;
                continue;
            }
        }

        PUNCT.lastIndex = i;
        const p = PUNCT.exec(code)![0]; // `[^]` always matches
        push("punct", p, i, i + p.length);
        i += p.length;
    }

    return tokens;
}

// ---------------------------------------------------------------------------
// Scanner

// ASI helpers
const NO_ASI_AFTER = new Set(["in", "of", "instanceof", "typeof", "new", "delete", "void", "await", "extends"]);
const CONTINUE_WORDS = new Set(["in", "instanceof", "extends"]);
const NO_CONTINUE_PUNCT = new Set(["{", "!", "~", "++", "--", "@", "#", "'", "\""]);

interface Clause {
    attributes: Record<string, string> | null;
    attributesKeyword: AttributesKeyword | null;
    end: number;
}

interface Declaration {
    kind: Exclude<DeclarationKind, "expression">;
    names: Array<string | null>;
    end: number;
}

/** Scan JavaScript source for imports and exports in a single pass. */
export function scanModule(code: string): ModuleScan {
    if (!code.includes("import") && !code.includes("export")) return {imports: [], exports: [], importMeta: []};
    return scanTokens(code, tokenize(code));
}

function scanTokens(code: string, tokens: Token[]): ModuleScan {
    const imports: ImportInfo[] = [];
    const exports: ExportInfo[] = [];
    const importMeta: ImportMetaInfo[] = [];

    const lineStarts = [0];
    for (let i = code.indexOf("\n"); i !== -1; i = code.indexOf("\n", i + 1)) lineStarts.push(i + 1);
    const loc = (pos: number): {line: number; column: number;} => {
        let lo = 0, hi = lineStarts.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (lineStarts[mid] <= pos) lo = mid;
            else hi = mid - 1;
        }
        return {line: lo + 1, column: pos - lineStarts[lo]};
    };

    // Lookups past either end of `tokens` return undefined, so these accept it
    const isP = (t: Token | undefined, v: string): boolean => t?.type === "punct" && t.value === v;
    const isN = (t: Token | undefined, v?: string): boolean => t?.type === "name" && (v === undefined || t.value === v);
    const isLiteral = (t: Token | undefined): boolean => t?.type === "str" || (t?.type === "tpl" && t.head && t.tail);

    const delta = (t: Token): number => {
        if (t.type === "tpl") return t.head === t.tail ? 0 : t.head ? 1 : -1; // `${ ... }`
        if (t.type !== "punct") return 0;
        const v = t.value;
        return v === "(" || v === "[" || v === "{" ? 1 : v === ")" || v === "]" || v === "}" ? -1 : 0;
    };
    const matchForward = (k: number): number => {
        for (let d = 0; k < tokens.length; k++) if ((d += delta(tokens[k])) === 0) return k;
        return tokens.length - 1;
    };
    const matchBackward = (k: number): number => {
        for (let d = 0; k >= 0; k--) if ((d -= delta(tokens[k])) === 0) return k;
        return 0;
    };
    /** Index of the next top-level `,` from k, or `close` */
    const skipToComma = (k: number, close: number): number => {
        for (let d = 0; k < close; k++) {
            d += delta(tokens[k]);
            if (d === 0 && isP(tokens[k], ",")) break;
        }
        return k;
    };

    const ispec = (imported: string, local: string | null): ImportSpecifier => ({
        kind: imported === "default" ? "default" : imported === "*" ? "namespace" : "named",
        imported,
        local,
    });
    const espec = (exported: string | null, local: string | null): ExportSpecifier => {
        if (local === "*") return exported === null ? {kind: "all", exported, local} : {kind: "namespace", exported, local};
        if (exported === "default") return {kind: "default", exported, local};
        return {kind: "named", exported: exported ?? "", local: local ?? ""}; // `?? ""` only for malformed `{ a as }`
    };

    /** `{ type: "json", "x-key": 'y' }` at tokens[open] → `{ type: "json", "x-key": "y" }` */
    const readAttributes = (open: number): {attributes: Record<string, string>; close: number;} => {
        const close = matchForward(open);
        const attributes: Record<string, string> = {};
        for (let k = open + 1; k < close; k++) {
            const key = tokens[k], value = tokens[k + 2];
            if ((isN(key) || key.type === "str") && isP(tokens[k + 1], ":") && isLiteral(value) && (k + 3 === close || isP(tokens[k + 3], ","))) {
                attributes[key.value] = value.value;
                k += 3;
            }
            else {k = skipToComma(k, close);}
        }
        return {attributes, close};
    };

    /** Module specifier at tokens[k] plus optional `with { ... }` / legacy `assert { ... }` */
    const readClause = (k: number): Clause => {
        const kw = tokens[k + 1];
        const keyword = isN(kw, "with") ? "with" : isN(kw, "assert") && !kw.nl ? "assert" : null;
        if (keyword && isP(tokens[k + 2], "{")) {
            const {attributes, close} = readAttributes(k + 2);
            return {attributes, attributesKeyword: keyword, end: tokens[close].end};
        }
        return {attributes: null, attributesKeyword: null, end: tokens[k].end};
    };

    /** `{ a, b as c, "str" as d }` → add(first, second); returns index of `}` */
    const readList = (open: number, add: (first: string, second: string | null) => void): number => {
        const close = matchForward(open);
        for (let k = open + 1; k < close; k += 2) {
            const first = tokens[k].value;
            let second: string | null = first;
            if (isN(tokens[k + 1], "as")) {
                second = tokens[k + 2]?.value ?? null;
                k += 2;
            }
            add(first, second);
        }
        return close;
    };

    /** Destructuring keys: `{ a, b: c, default: d, e = 1 }` → specs (for dynamic imports) */
    const readPatternKeys = (open: number, close: number, specs: ImportSpecifier[]): void => {
        for (let k = open + 1; k < close; k++) {
            const t = tokens[k];
            if (isN(t) || t.type === "str") {
                let local: string | null = t.value;
                if (isP(tokens[k + 1], ":")) {
                    const v = tokens[k + 2], after = tokens[k + 3];
                    local = isN(v) && (k + 3 === close || isP(after, ",") || isP(after, "=")) ? v.value : null;
                }
                specs.push(ispec(t.value, local));
            }
            k = skipToComma(k, close);
        }
    };

    /** Destructuring bindings: `{ a, b: c, d: { e }, ...f }` / `[g, , [h]]` → names (for export const) */
    const collectBindings = (open: number, close: number, names: string[]): void => {
        const obj = isP(tokens[open], "{");
        for (let m = open + 1; m < close; m++) {
            if (isP(tokens[m], "...")) {m++;}
            else if (obj) {
                if (isP(tokens[m], "[")) m = matchForward(m); // computed key
                if (isP(tokens[m + 1], ":")) m += 2;
            }
            const t = tokens[m];
            if (isP(t, ",")) continue; // array hole
            if (isN(t)) {names.push(t.value);}
            else if (isP(t, "{") || isP(t, "[")) {
                const c = matchForward(m);
                collectBindings(m, c, names);
                m = c;
            }
            m = skipToComma(m + 1, close);
        }
    };

    const endsExpr = (t: Token): boolean =>
        t.type === "num" || t.type === "str" || t.type === "regex" || (t.type === "tpl" && t.tail)
        || (t.type === "name" && !NO_ASI_AFTER.has(t.value))
        || (t.type === "punct" && (t.value === ")" || t.value === "]" || t.value === "}" || t.value === "++" || t.value === "--"));

    const continues = (t: Token): boolean => {
        if (t.type === "tpl") return t.head; // tagged template
        if (t.type === "name") return CONTINUE_WORDS.has(t.value);
        return t.type === "punct" && !NO_CONTINUE_PUNCT.has(t.value);
    };

    /** Index of the last token of the statement starting at tokens[k] (`;` or ASI) */
    const statementEnd = (k: number): number => {
        for (let m = k, d = 0; m < tokens.length; m++) {
            const t = tokens[m];
            if (d === 0 && m > k) {
                if (isP(t, ";")) return m - 1;
                if (t.nl && endsExpr(tokens[m - 1]) && !continues(t)) return m - 1;
            }
            if ((d += delta(t)) < 0) return m - 1; // closed an enclosing block
        }
        return tokens.length - 1;
    };

    /** Index of the closing `}` of a function / class body */
    const blockEnd = (k: number): number => {
        for (let m = k + 1, d = 0; m < tokens.length; m++) {
            if (d === 0 && isP(tokens[m], "{")) return matchForward(m);
            if ((d += delta(tokens[m])) < 0) return m - 1;
        }
        return tokens.length - 1;
    };

    /** function / class / const / let / var at tokens[k] */
    const readDeclaration = (k: number): Declaration | null => {
        while (isP(tokens[k], "@")) { // decorators: @a, @a.b, @a(...), @(expr)
            k++;
            if (isP(tokens[k], "(")) {k = matchForward(k) + 1; continue;}
            while (isN(tokens[k]) && isP(tokens[k + 1], ".")) k += 2;
            if (isP(tokens[++k], "(")) k = matchForward(k) + 1;
        }
        if (isN(tokens[k], "async") && isN(tokens[k + 1], "function") && !tokens[k + 1].nl) k++;

        const t = tokens[k];
        const next = tokens[k + 1];
        const keyword = t?.type === "name" ? t.value : "";

        if (keyword === "function") {
            const n = isP(next, "*") ? tokens[k + 2] : next;
            return {kind: "function", names: [isN(n) ? n.value : null], end: tokens[blockEnd(k)].end};
        }
        if (keyword === "class") {
            return {kind: "class", names: [isN(next) && next.value !== "extends" ? next.value : null], end: tokens[blockEnd(k)].end};
        }
        if (keyword === "const" || keyword === "let" || keyword === "var") {
            const last = statementEnd(k);
            const names: string[] = [];
            for (let m = k + 1; m <= last; m++) {
                const b = tokens[m];
                if (isN(b)) {names.push(b.value);}
                else if (isP(b, "{") || isP(b, "[")) {
                    const c = matchForward(m);
                    collectBindings(m, c, names);
                    m = c;
                }
                else {break;}
                m = skipToComma(m + 1, last + 1); // skip initializer to the next declarator
            }
            return {kind: keyword, names, end: tokens[last].end};
        }
        return null;
    };

    const parseStatic = (i: number): StaticImport | null => {
        const specs: ImportSpecifier[] = [];
        let j = i + 1;
        let t = tokens[j];

        if (t.type !== "str") {
            // phase modifier: `import defer * as ns from "x"` / `import source x from "x"`
            if ((isN(t, "defer") || isN(t, "source")) && !isN(tokens[j + 1], "from") && !isP(tokens[j + 1], ",")) {
                t = tokens[++j];
            }

            if (isN(t)) {
                specs.push(ispec("default", t.value));
                t = tokens[++j];
                if (isP(t, ",")) t = tokens[++j];
            }

            if (isP(t, "*")) {
                specs.push(ispec("*", tokens[j + 2]?.value ?? null));
                j += 3;
                t = tokens[j];
            }
            else if (isP(t, "{")) {
                j = readList(j, (imported, local) => specs.push(ispec(imported, local))) + 1;
                t = tokens[j];
            }

            if (!isN(t, "from") || tokens[j + 1]?.type !== "str") return null;
            t = tokens[++j];
        }

        const start = tokens[i].start;
        const {attributes, attributesKeyword, end} = readClause(j);
        return {
            source: t.value,
            dynamic: false,
            specifiers: specs,
            attributes,
            attributesKeyword,
            ...loc(start),
            start,
            end,
        };
    };

    const parseDynamic = (i: number): DynamicImport | null => {
        const close = matchForward(i + 1);
        if (isP(tokens[close + 1], "{")) return null; // method named `import`: `{ import() {} }`

        const start = tokens[i].start;
        const info: DynamicImport = {
            source: null,
            dynamic: true,
            specifiers: [],
            attributes: null,
            attributesKeyword: null,
            ...loc(start),
            start,
            end: tokens[close].end,
        };
        const specs = info.specifiers;

        // first argument: tokens up to the first top-level comma
        const argEnd = skipToComma(i + 2, close);
        if (argEnd === i + 3 && isLiteral(tokens[i + 2])) info.source = tokens[i + 2].value;
        else if (argEnd > i + 2) info.expression = code.slice(tokens[i + 2].start, tokens[argEnd - 1].end);

        // options: import("x", { with: { type: "json" } })
        if (argEnd < close && isP(tokens[argEnd + 1], "{")) {
            const optClose = matchForward(argEnd + 1);
            for (let k = argEnd + 2; k < optClose; k++) {
                const key = tokens[k];
                const keyword = key.value === "with" || key.value === "assert" ? key.value : null;
                if (keyword && (isN(key) || key.type === "str") && isP(tokens[k + 1], ":") && isP(tokens[k + 2], "{")) {
                    info.attributes = readAttributes(k + 2).attributes;
                    info.attributesKeyword = keyword;
                    break;
                }
                k = skipToComma(k, optClose);
            }
        }

        if (isN(tokens[i - 1], "await")) {
            const before = tokens[i - 2];
            if (isP(before, "=")) {
                const target = tokens[i - 3];
                // const ns = await import("x")
                if (isN(target) && !isP(tokens[i - 4], ".") && !isP(tokens[i - 4], "?.")) specs.push(ispec("*", target.value));
                // const { a, b: c } = await import("x")
                else if (isP(target, "}")) readPatternKeys(matchBackward(i - 3), i - 3, specs);
            }
            else if (
                isP(before, "(") && isP(tokens[close + 1], ")")
                && (isP(tokens[close + 2], ".") || isP(tokens[close + 2], "?.")) && isN(tokens[close + 3])
            ) {
                // (await import("x")).foo
                specs.push(ispec(tokens[close + 3].value, null));
            }
        }

        // import("x").then(m => ...) / .then(({ a }) => ...) / .then(function (m) { ... })
        if (isP(tokens[close + 1], ".") && isN(tokens[close + 2], "then") && isP(tokens[close + 3], "(")) {
            let k = close + 4;
            if (isN(tokens[k], "async")) k++;
            if (isN(tokens[k], "function")) {k++; if (isN(tokens[k])) k++;}
            if (isN(tokens[k]) && isP(tokens[k + 1], "=>")) {
                specs.push(ispec("*", tokens[k].value));
            }
            else if (isP(tokens[k], "(")) {
                if (isN(tokens[k + 1]) && (isP(tokens[k + 2], ")") || isP(tokens[k + 2], ","))) specs.push(ispec("*", tokens[k + 1].value));
                else if (isP(tokens[k + 1], "{")) readPatternKeys(k + 1, matchForward(k + 1), specs);
            }
        }

        return info;
    };

    const parseExport = (i: number): ExportInfo | null => {
        const start = tokens[i].start;
        const specifiers: ExportSpecifier[] = [];
        const done = (
            src: Token | null, declaration: DeclarationKind | null, clause: Clause, declarationStart: number | null = null,
        ): ExportInfo => ({
            source: src?.value ?? null,
            declaration,
            declarationStart,
            specifiers,
            attributes: clause.attributes,
            attributesKeyword: clause.attributesKeyword,
            ...loc(start),
            start,
            end: clause.end,
        });
        const plain = (end: number): Clause => ({attributes: null, attributesKeyword: null, end});
        let j = i + 1;
        const t = tokens[j];

        // export * from "x" / export * as ns from "x"
        if (isP(t, "*")) {
            let exported: string | null = null;
            if (isN(tokens[j + 1], "as")) {
                exported = tokens[j + 2]?.value ?? null;
                j += 2;
            }
            if (!isN(tokens[j + 1], "from") || tokens[j + 2]?.type !== "str") return null;
            specifiers.push(espec(exported, "*"));
            return done(tokens[j + 2], null, readClause(j + 2));
        }

        // export { a, b as c } / export { a as default } from "x"
        if (isP(t, "{")) {
            const close = readList(j, (local, exported) => specifiers.push(espec(exported, local)));
            if (isN(tokens[close + 1], "from") && tokens[close + 2]?.type === "str") {
                return done(tokens[close + 2], null, readClause(close + 2));
            }
            return done(null, null, plain(tokens[close].end));
        }

        // export default ...
        if (isN(t, "default")) {
            const decl = readDeclaration(j + 1);
            const declStart = tokens[j + 1]?.start ?? null;
            if (decl) {
                specifiers.push(espec("default", decl.names[0] ?? null));
                return done(null, decl.kind, plain(decl.end), declStart);
            }
            const last = statementEnd(j + 1);
            const only = tokens[j + 1];
            const local = last === j + 1 && isN(only) && !/^(?:this|null|true|false)$/.test(only.value) ? only.value : null;
            specifiers.push(espec("default", local));
            return done(null, "expression", plain(tokens[last].end), declStart);
        }

        // export function / class / const / let / var
        const decl = readDeclaration(j);
        if (!decl) return null;
        for (const name of decl.names) if (name) specifiers.push(espec(name, name));
        return done(null, decl.kind, plain(decl.end), t.start);
    };

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.type !== "name" || (t.value !== "import" && t.value !== "export")) continue;
        const prev = tokens[i - 1] as Token | undefined, next = tokens[i + 1] as Token | undefined;
        if (!next || isP(prev, ".") || isP(prev, "?.")) continue; // obj.import / obj.export

        if (t.value === "import") {
            if (isP(next, ".")) {
                if (isN(tokens[i + 2], "meta")) {
                    const access = tokens[i + 3], prop = tokens[i + 4];
                    const property = (isP(access, ".") || isP(access, "?.")) && isN(prop) ? prop.value : null;
                    importMeta.push({property, ...loc(t.start), start: t.start, end: tokens[i + 2].end});
                }
                continue;
            }
            const info = isP(next, "(") ? parseDynamic(i) : parseStatic(i);
            if (info) imports.push(info);
        }
        else {
            const info = parseExport(i);
            if (info) exports.push(info);
        }
    }

    return {imports, exports, importMeta};
}

export type ModuleType = "module" | "commonjs";

/**
 * `"esm"` if the code has ESM-only syntax (a static `import`, `export`, or `import.meta`),
 * otherwise `"commonjs"`, the same default as Node's syntax detection. Dynamic `import()` works in
 * both, so it doesn't count. Top-level `await` isn't detected.
 */
export function detectModuleType(code: string): ModuleType {
    const {imports, exports, importMeta} = scanModule(code);
    return exports.length > 0 || importMeta.length > 0 || imports.some((info) => !info.dynamic) ? "module" : "commonjs";
}

/** Scan JavaScript source for static `import` declarations and dynamic `import()` calls. */
export function scanImports(code: string): ImportInfo[] {
    return scanModule(code).imports;
}

/** Scan JavaScript source for exports, including re-exports (`export ... from "x"`). */
export function scanExports(code: string): ExportInfo[] {
    return scanModule(code).exports;
}

export interface SectionReplacers {
    /**
     * Return replacement text for the import, or null / undefined to keep it. `text` doesn't include
     * the trailing `;`, so the original one stays.
     */
    imports?: (info: ImportInfo, text: string) => string | null | undefined;
    /**
     * Return replacement text for the export, or null / undefined to keep it. `declaration` is the
     * declaration or default expression with `export` / `export default` stripped off (null for
     * `export { }` lists and `export *`). `text` includes the statement's own `;` (if it's on the same
     * line), so replacements should end with `;`. That keeps minified code like
     * `export function a(){}export function b(){}` valid.
     */
    exports?: (info: ExportInfo, text: string, declaration: string | null) => string | null | undefined;
    /**
     * Return replacement text for `import.meta`, or null / undefined to keep it. Only `import.meta`
     * itself is replaced, so `import.meta.url` → `__meta.url` if you return `"__meta"`.
     */
    importMeta?: (info: ImportMetaInfo, text: string) => string | null | undefined;
}

type Section = {start: number; end: number; children: Section[]; output: string | null;} & (
    | {kind: "import"; info: ImportInfo;}
    | {kind: "export"; info: ExportInfo;}
    | {kind: "meta"; info: ImportMetaInfo;}
);

const TRAILING_SEMI = /[ \t]*;/y;

/**
 * Replace whole imports, exports and `import.meta` in one pass. Each callback runs once per match.
 * Nested ones run first: for `export const load = () => import("x")`, the import callback runs, and
 * the export callback's `text` / `declaration` already contain its replacement. Fields on `info`
 * (like a dynamic import's `expression`) describe the original code, so build replacements from
 * `text` / `declaration` to keep nested replacements.
 */
export function replaceSections(code: string, {imports, exports, importMeta}: SectionReplacers): string {
    const scan = scanModule(code);
    const sections: Section[] = [];

    if (importMeta) {
        for (const info of scan.importMeta) {
            sections.push({kind: "meta", info, start: info.start, end: info.end, children: [], output: null});
        }
    }
    if (imports) {
        for (const info of scan.imports) {
            sections.push({kind: "import", info, start: info.start, end: info.end, children: [], output: null});
        }
    }
    if (exports) {
        for (const info of scan.exports) {
            TRAILING_SEMI.lastIndex = info.end;
            const end = TRAILING_SEMI.test(code) ? TRAILING_SEMI.lastIndex : info.end;
            sections.push({kind: "export", info, start: info.start, end, children: [], output: null});
        }
    }
    sections.sort((a, b) => a.start - b.start || b.end - a.end);

    // Nest sections: dynamic imports and import.meta can sit inside exports and dynamic imports
    const roots: Section[] = [];
    const stack: Section[] = [];
    for (const s of sections) {
        while (stack.length && stack[stack.length - 1].end <= s.start) stack.pop();
        const parent = stack[stack.length - 1] as Section | undefined;
        if (parent && s.end > parent.end) continue; // partial overlap (malformed code)
        (parent ? parent.children : roots).push(s);
        stack.push(s);
    }

    // code[from, to) with the children inside that range replaced
    const stitch = (from: number, to: number, children: Section[]): string => {
        let out = "";
        let pos = from;
        for (const c of children) {
            if (c.start < from || c.end > to) continue;
            out += code.slice(pos, c.start) + render(c);
            pos = c.end;
        }
        return out + code.slice(pos, to);
    };

    const render = (s: Section): string => {
        if (s.output !== null) return s.output; // already rendered (exports stitch children twice)
        const text = stitch(s.start, s.end, s.children);
        let next: string | null | undefined;
        if (s.kind === "import") {
            next = imports?.(s.info, text);
        }
        else if (s.kind === "meta") {
            next = importMeta?.(s.info, text);
        }
        else {
            const {declarationStart, end} = s.info;
            next = exports?.(s.info, text, declarationStart === null ? null : stitch(declarationStart, end, s.children));
        }
        return (s.output = next ?? text);
    };

    return stitch(0, code.length, roots);
}

/** Replace whole imports. Shorthand for `replaceSections(code, { imports: replace })`. */
export function replaceImports(code: string, replace: NonNullable<SectionReplacers["imports"]>): string {
    return replaceSections(code, {imports: replace});
}

/** Replace whole exports. Shorthand for `replaceSections(code, { exports: replace })`. */
export function replaceExports(code: string, replace: NonNullable<SectionReplacers["exports"]>): string {
    return replaceSections(code, {exports: replace});
}

/** Replace `import.meta`. Shorthand for `replaceSections(code, { importMeta: replace })`. */
export function replaceImportMeta(code: string, replace: NonNullable<SectionReplacers["importMeta"]>): string {
    return replaceSections(code, {importMeta: replace});
}