export default function getNestedProp<T extends Record<string | number | symbol, unknown>, R = any>(object: T, path: string, skipLast?: boolean): R {
    if (!path) return object as unknown as R; // If path is empty, return the object itself
    const split = path.split(".");
    if (skipLast) split.pop();
    return split.reduce((acc, curr) => acc && acc[curr as keyof typeof acc], object as object) as R;
}