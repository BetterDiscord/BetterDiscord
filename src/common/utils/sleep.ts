export function sleep(delay: number) {
    return new Promise<void>(done => setTimeout(() => done(), delay));
}