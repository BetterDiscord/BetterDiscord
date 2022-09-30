
/**
 * Deep extends an object with a set of other objects. Objects later in the list
 * of `extenders` have priority, that is to say if one sets a key to be a primitive,
 * it will be overwritten with the next one with the same key. If it is an object,
 * and the keys match, the object is extended. This happens recursively.
 * @param {object} extendee - Object to be extended
 * @param {...object} extenders - Objects to extend with
 * @returns {object} - A reference to `extendee`
 */
export default function extend(extendee: ObjectLiteral, ...extenders: ObjectLiteral[]) {
    for (let i = 0; i < extenders.length; i++) {
        for (const key in extenders[i]) {
            if (extenders[i].hasOwnProperty(key)) {
                if (typeof extendee[key] === "object" && typeof extenders[i][key] === "object") {
                    extend(extendee[key] as ObjectLiteral, extenders[i][key] as ObjectLiteral);
                }
                else if (typeof extenders[i][key] === "object") {
                    extendee[key] = {};
                    extend(extendee[key] as ObjectLiteral, extenders[i][key] as ObjectLiteral);
                }
                else {
                    extendee[key] = extenders[i][key];
                }
            }
        }
    }
    return extendee;
}