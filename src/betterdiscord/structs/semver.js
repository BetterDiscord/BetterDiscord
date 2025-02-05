// "Official" regex from https://semver.org/
export const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;


// Some of the code here adapted from https://github.com/npm/node-semver
const numeric = /^[0-9]+$/;
function compare(a, b) {
    const anum = numeric.test(a);
    const bnum = numeric.test(b);

    if (anum && bnum) {
        a = +a;
        b = +b;
    }

    if (a === b) return 0;
    else if (anum && !bnum) return -1;
    else if (bnum && !anum) return 1;
    else if (a < b) return -1;
    return 1;
}

function tokenize(pre) {
    return pre.split(".").map((id) => {
        if (!numeric.test(id)) return id;
        const num = +id; // convert to number and check if valid
        if (num >= 0 && num < Number.MAX_SAFE_INTEGER) return num;
        return id; // Unsafe number => keep as string
    });
}

function compareTokens(a, b) {
    const atokens = tokenize(a);
    const btokens = tokenize(b);

    // Compare token by token whether it's a string or number
    for (let index = 0; ; index++) {
        const x = atokens[index];
        const y = btokens[index];
        if (x === undefined && y === undefined) return 0;
        else if (y === undefined) return 1;
        else if (x === undefined) return -1;
        else if (x === y) continue;
        return compare(x, y);
    } 
}

function preCompare(a, b) {
    // Having a prerelease makes it a "lower" version
    if (a.length && !b.length) return -1;
    else if (!a.length && b.length) return 1;
    else if (!a.length && !b.length) return 0;
    return compareTokens(a, b);
}

/**
 * This works on semantic versioning e.g. "1.0.0".
 * 
 * @param {string} currentVersion
 * @param {string} remoteVersion
 * @returns {number} 0 indicates equal, -1 indicates left hand greater, 1 indicates right hand greater
 */
export function comparator(currentVersion, remoteVersion) {
    const current = regex.exec(currentVersion);
    const remote = regex.exec(remoteVersion);

    // Raw match is at [0] so major starts at [1]
    // This compares only the major, minor, and patch levels
    const versionCompare = compare(remote[1], current[1]) || compare(remote[2], current[2]) || compare(remote[3], current[3]);

    // Also need to check prerelease and build info
    const prereleaseCompare = preCompare(remote[4] ?? "", current[4] ?? "");
    const buildCompare = compareTokens(remote[5] ?? "", current[5] ?? "");

    return versionCompare || prereleaseCompare || buildCompare;
}