const versions = process.versions;
versions.nodejs = versions.node;
// @ts-expect-error necessary evil
delete versions.node; // Monaco will break if process.versions.node exists

export default {
    isWeb: true,
    versions: versions,
    env: process.env,
    arch: process.arch,
    platform: process.platform,
};