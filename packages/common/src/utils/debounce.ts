/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 * 
 * 
 * @param {function} executor 
 * @param {number} delay 
 */
export default function debounce(executor: AnyFunction, delay: number) {
    let timeout: NodeJS.Timeout;
    return function(...args: unknown[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => executor(...args), delay);
    };
}