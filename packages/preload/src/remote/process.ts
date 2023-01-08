export const {
    platform,
    versions,
    exit
} = process;

export const env = Object.assign({}, process.env);

export default {platform, env, versions, exit};
