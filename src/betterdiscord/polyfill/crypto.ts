import Remote from "./remote";


export default {
    ...Remote.crypto,
    // Wrap it in Buffer
    randomBytes(length: number) {
        return Buffer.from(Remote.crypto.randomBytes(length));
    }
};