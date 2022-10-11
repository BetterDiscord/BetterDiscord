export function getKeys(object) {
    const keys = [];

    for (const key in object) keys.push(key);

    return keys;
}

export default function cloneObject(target, newObject = {}, keys) {
    if (!Array.isArray(keys)) keys = getKeys(target);
    
    return keys.reduce((clone, key) => {
        if (typeof(target[key]) === "object" && !Array.isArray(target[key]) && target[key] !== null) clone[key] = cloneObject(target[key], {});
        else if (typeof target[key] === "function") clone[key] = target[key].bind(target);
        else clone[key] = target[key];

        return clone;
    }, newObject);
}