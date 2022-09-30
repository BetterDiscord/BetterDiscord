export function getKeys(object: ObjectLiteral) {
    const keys: Array<keyof typeof object> = [];

    for (const key in object) keys.push(key);

    return keys;
}

export default function cloneObject(target: ObjectLiteral, newObject: ObjectLiteral = {}, keys?: Array<keyof ObjectLiteral>) {
    if (!Array.isArray(keys)) keys = getKeys(target);
    
    return keys.reduce((clone, key) => {
        if (typeof(target[key]) === "object" && !Array.isArray(target[key]) && target[key] !== null) clone[key] = cloneObject(target[key] as ObjectLiteral, {});
        else if (typeof target[key] === "function") clone[key] = (<AnyFunction>target[key]).bind(target);
        else clone[key] = target[key];

        return clone;
    }, newObject);
}