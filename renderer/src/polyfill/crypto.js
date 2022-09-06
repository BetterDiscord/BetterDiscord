import Remote from "./remote";

export default {
    ...Remote.crypto,
    // Wrap it in Buffer
    randomBytes(length) {
        return Buffer.from(Remote.crypto.randomBytes(length));
    }
};