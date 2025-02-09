/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 *
 * @param executor function to debounce
 * @param delay time to delay in milliseconds
 */
export default function debounce<T extends (...args: any[]) => any>(executor: T, delay: number) {
    let timeout: Timer;
    return function(...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => executor(...args), delay);
    };
}