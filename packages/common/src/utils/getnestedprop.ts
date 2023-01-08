export default function getNestedProp(object: any, path: string, skipLast?: boolean) {
    const split = path.split(".");

    if (skipLast) {
        split.pop();
    }

    return split.reduce((acc, curr) => acc[curr], object);
}
