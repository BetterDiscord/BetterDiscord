export default function debounce<T extends (...args: any[]) => any>(executor: T, delay: number) {
    let timeout: Timer;
    return function(...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => executor(...args), delay);
    };
}