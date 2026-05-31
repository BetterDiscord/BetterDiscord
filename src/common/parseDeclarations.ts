/* eslint-disable no-labels */
const enum CharCodes {
    OpenBrace = 123,
    CloseBrace = 125,
    OpenParenthesis = 40,
    CloseParenthesis = 41,
    OpenBracket = 91,
    CloseBracket = 93,
    DoubleQuote = 34,
    SingleQuote = 39,
    Backtick = 96,
    Slash = 47,
    Backslash = 92,
    Semicolon = 59,
    Colon = 58,
    Equals = 61,
    Comma = 44,
    Zero = 48,
    Nine = 57,
    CapitalA = 65,
    CapitalZ = 90,
    LowerA = 97,
    LowerZ = 122,
    Underscore = 95,
    Dollar = 36,
    Space = 32,
    Exclamation = 33
}

const singleDeclarations = ["function ", "async function ", "class "];
const multiDeclarations = ["let", "var", "const"];

// This is very specifically for Discord's minified code
export default function parseDeclarations(moduleString: string, baseDepth = 1) {
    let depth = 0;
    let inDeclaration = false;
    let destructuringDepth = 0;
    const declarations: string[] = [];

    for (let i = 0; i < moduleString.length; i++) {
        const code = moduleString.charCodeAt(i);
        checkChar: switch (code) {
            case CharCodes.OpenBrace:
            case CharCodes.OpenParenthesis:
            case CharCodes.OpenBracket:
                depth++;
                break;
            case CharCodes.CloseBrace:
            case CharCodes.CloseParenthesis:
            case CharCodes.CloseBracket:
                depth--;

                // Check if we just closed a destructure
                if (depth >= baseDepth && depth < baseDepth + destructuringDepth) {
                    destructuringDepth = depth - baseDepth;
                }
                break;
            case CharCodes.DoubleQuote:
            case CharCodes.SingleQuote:
                i = findEndOfString(moduleString, i + 1, code);
                break;
            case CharCodes.Backtick:
                i = findEndOfTemplateLiteral(moduleString, i + 1);
                break;
            case CharCodes.Slash: {
                // Ignore regex
                const prevCode = moduleString.charCodeAt(i - 1);
                if (
                    (!isVariableCharacter(prevCode) || moduleString.startsWith("return", i - 6))
                    && prevCode !== CharCodes.CloseParenthesis
                    && prevCode !== CharCodes.CloseBracket
                ) {
                    i = findEndOfRegex(moduleString, i + 1);
                }
                break;
            }
            default: {
                if (depth < baseDepth || depth > baseDepth + destructuringDepth) break;

                // If we find a declaration keyword begin the declaration state
                if (!inDeclaration) {
                    // Check if there is a single declaration (function/class)
                    for (const keyword of singleDeclarations) {
                        if (!moduleString.startsWith(keyword, i)) continue;

                        const charBefore = moduleString.charCodeAt(i - 1);
                        if (charBefore === CharCodes.Equals || charBefore === CharCodes.Exclamation) continue;

                        const [declaration] = getVariableName(moduleString, i + keyword.length);
                        declarations.push(declaration);
                        i += declaration.length + keyword.length - 1;

                        break checkChar;
                    }

                    for (const keyword of multiDeclarations) {
                        if (!moduleString.startsWith(keyword, i)) continue;

                        // If the next character isn't whitespace or destructuring skip it
                        const nextChar = moduleString.charCodeAt(i + keyword.length);
                        if (nextChar === CharCodes.Space) i++;
                        else if (nextChar !== CharCodes.OpenBrace && nextChar !== CharCodes.OpenBracket) continue;

                        const [declaration, destructuredAmount, offset] = getVariableName(moduleString, i + keyword.length);

                        depth += destructuredAmount;
                        destructuringDepth += destructuredAmount;

                        // Add the declaration
                        declarations.push(declaration);
                        i += keyword.length + offset - 1;
                        inDeclaration = true;

                        break checkChar;
                    }

                    break;
                }

                // If we hit a semicolon the declaration is done
                if (code === CharCodes.Semicolon) {
                    inDeclaration = false;
                    break;
                }

                // If we're at a comma, add the next variable
                if (code === CharCodes.Comma) {
                    const [declaration, destructureAmount, offset] = getVariableName(moduleString, i + 1);

                    depth += destructureAmount;
                    destructuringDepth += destructureAmount;

                    declarations.push(declaration);
                    i += offset;
                }
            }
        }
    }

    return declarations;
}

function getVariableName(moduleString: string, startIndex: number): [string, number, number] {
    const initialStart = startIndex;
    let destructuredAmount = 0;
    let isFirstCharacter = true;

    for (let i = startIndex; i < moduleString.length; i++) {
        const code = moduleString.charCodeAt(i);

        // Check if we're actually destructuring
        if (isFirstCharacter && (code === CharCodes.OpenBrace || code === CharCodes.OpenBracket)) {
            destructuredAmount++;
            startIndex = i + 1;
        }
        else {
            isFirstCharacter = false;

            // If we're at a colon the variable is being renamed in an object destructure
            if (code === CharCodes.Colon) {
                startIndex = i + 1;
                isFirstCharacter = true;
            }
            else if (!isVariableCharacter(code)) {
                return [moduleString.slice(startIndex, i), destructuredAmount, i - initialStart];
            }
        }
    }

    return [moduleString.slice(startIndex), 0, moduleString.length - initialStart];
}

function findEndOfString(moduleString: string, startIndex: number, quoteChar: CharCodes) {
    let shouldEscape = false;

    // Go until we find a non-escaped quote character
    for (let i = startIndex; i < moduleString.length; i++) {
        const code = moduleString.charCodeAt(i);

        if (code === quoteChar && !shouldEscape) return i;

        // Escape characters if there are an odd number of backslashes before them
        if (code === CharCodes.Backslash) shouldEscape = !shouldEscape;
        else shouldEscape = false;
    }

    return moduleString.length;
}

function findEndOfRegex(moduleString: string, startIndex: number) {
    let inCharacterSet = false;
    let shouldEscape = false;

    for (let i = startIndex; i < moduleString.length; i++) {
        const code = moduleString.charCodeAt(i);

        if (inCharacterSet) {
            if (code === CharCodes.CloseBracket && !shouldEscape) {
                inCharacterSet = false;
            }
        }
        else {
            if (code === CharCodes.Slash && !shouldEscape) {
                return i;
            }
            else if (code === CharCodes.OpenBracket && !shouldEscape) {
                inCharacterSet = true;
            }
        }

        if (code === CharCodes.Backslash) shouldEscape = !shouldEscape;
        else shouldEscape = false;
    }

    return moduleString.length;
}

// This does a little recursion (bad), but nested template literals are very rare so it's fine
function findEndOfTemplateLiteral(moduleString: string, startIndex: number) {
    let depth = 0;
    let lastCode = 0;
    let shouldEscape = false;

    for (let i = startIndex; i < moduleString.length; i++) {
        const code = moduleString.charCodeAt(i);

        if (depth === 0) {
            // If we found the end, stop
            if (code === CharCodes.Backtick && !shouldEscape) {
                return i;
            }

            // If we're at a ${, increase the depth and try to find the end
            if (code === CharCodes.OpenBrace && lastCode === CharCodes.Dollar && !shouldEscape) {
                depth++;
            }

            if (code === CharCodes.Backslash) shouldEscape = !shouldEscape;
            else if (code !== CharCodes.Dollar) shouldEscape = false;
        }
        else {
            switch (code) {
                case CharCodes.OpenBrace:
                    depth++;
                    break;
                case CharCodes.CloseBrace:
                    depth--;
                    break;
                case CharCodes.DoubleQuote:
                case CharCodes.SingleQuote:
                    i = findEndOfString(moduleString, i + 1, code);
                    break;
                case CharCodes.Backtick:
                    i = findEndOfTemplateLiteral(moduleString, i + 1);
                    break;
                case CharCodes.Slash: {
                    const prevCode = moduleString.charCodeAt(i - 1);
                    if (
                        (!isVariableCharacter(prevCode) || moduleString.startsWith("return", i - 6))
                        && prevCode !== CharCodes.CloseParenthesis
                        && prevCode !== CharCodes.CloseBracket
                    ) {
                        i = findEndOfRegex(moduleString, i + 1);
                    }
                    break;
                }
            }
        }

        lastCode = code;
    }

    return moduleString.length;
}

function isVariableCharacter(code: number) {
    return (
        (code >= CharCodes.LowerA && code <= CharCodes.LowerZ)
        || (code >= CharCodes.CapitalA && code <= CharCodes.CapitalZ)
        || (code >= CharCodes.Zero && code <= CharCodes.Nine)
        || code === CharCodes.Underscore
        || code === CharCodes.Dollar
    );
}