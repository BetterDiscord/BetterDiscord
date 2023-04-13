import electron from "electron";

const whitelist = {
    // Discord includes unsafe-inline already
    script: [
        "https://*.github.io",
        "https://cdnjs.cloudflare.com" // Used for Monaco
    ],

    // Discord includes nothing we need
    connect: [
        "https://api.github.com",
    ],

    // Discord includes unsafe-inline already
    style: [
        "https://*.github.io",
        "https://cdnjs.cloudflare.com", // Used for Monaco
        "https://fonts.googleapis.com",
    ],

    // Discord includes the other google font url
    font: [
        "data:",
        "https://*.github.io",
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com",
    ],

    // Discord includes several sources already including imgur
    img: [
        "https://*.github.io",
        "https://ik.imagekit.io",
        "https://source.unsplash.com",
    ],

    // Discord does not include this normally
    worker: [
        "'self'", // To allow Discord's own workers
        "data:", // Used for Monaco
    ],

};

const types = Object.keys(whitelist);

const strings = {};
for (const key of types) strings[key] = whitelist[key].join(" ") + " ";


function addToCSP(csp, type) {
    // If it's in the middle of the policy (most common case)
    if (csp.includes(`; ${type}-src `)) return csp.replace(`; ${type}-src `, `; ${type}-src ${strings[type]}`);

    // If it's the first rule (very uncommon, default-src should be first)
    else if (csp.includes(`${type}-src `)) return csp.replace(`${type}-src `, `${type}-src ${strings[type]}`);

    // Otherwise, rule doesn't exist, add it to the end
    return csp = csp + `; ${type}-src ${strings[type]}; `;
}

export default class {
    static remove() {
        electron.session.defaultSession.webRequest.onHeadersReceived(function(details, callback) {
            const headerKeys = Object.keys(details.responseHeaders);
            for (let h = 0; h < headerKeys.length; h++) {
                const key = headerKeys[h];
                
                // Because the casing is inconsistent for whatever reason...
                if (key.toLowerCase().indexOf("content-security-policy") !== 0) continue;

                // Grab current CSP policy and make sure it's Discord's
                // since that's the only one we need to modify
                let csp = details.responseHeaders[key];
                if (Array.isArray(csp)) csp = csp[0];
                if (!csp.toLowerCase().includes("discordapp")) continue;

                // Iterate over all whitelisted types and update the header
                for (let k = 0; k < types.length; k++) csp = addToCSP(csp, types[k]);
                details.responseHeaders[key] = [csp];
            }

            callback({cancel: false, responseHeaders: details.responseHeaders});
        });
    }
}