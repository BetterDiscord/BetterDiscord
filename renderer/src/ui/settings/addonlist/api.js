import {Utilities} from "modules";
import {ADDON_API_URL, STORE_API_URL, WEB_HOSTNAME} from "./constants";
import https from "https";

export const README_CACHE = {plugin: {}, theme: {}};
export const API_CACHE = {plugin: [], theme: [], lastFetch: 0};

export const splitArray = (array, max) => {
    const newArray = [];
    for (const child of array) {
        let lastIndex = newArray.length ? newArray.length - 1 : 0;
        if (!newArray[lastIndex]) {newArray.push([]);}
        else if (newArray[lastIndex].length >= max) {
            lastIndex++;
            newArray.push([]);
        }
        newArray[lastIndex].push(child);
    }

    return newArray;
};

export async function fetchData(type) {
    return new Promise(resolve => {
        https.get(STORE_API_URL.format({type}), res => {
            const chunks = [];
            res.on("data", chunk => chunks.push(chunk));

            res.on("end", () => {
                const json = Utilities.testJSON(chunks.join(""));
                if (!Array.isArray(json)) return res.emit("error");
                resolve(splitArray(json, 30));
            });

            res.on("error", console.error);
        });
    });
}

export async function fetchAddon(addon) {
    return new Promise(resolve => {
        https.get(ADDON_API_URL.format({addon}), res => {
            const chunks = [];
            res.on("data", chunk => chunks.push(chunk));

            res.on("end", () => {
                const json = Utilities.testJSON(chunks.join(""));

                if (!json) return res.emit("error");

                resolve(json);
            });

            res.on("error", console.error);
        });
    });
}

export async function fetchReadme(type, addonId) {
    if (README_CACHE[type][addonId]) return API_CACHE[type][addonId];

    // const data = await fetch(`https://api.${WEB_HOSTNAME}/v1/store/addons/readme/${addonId}`).then(response => response.text());
    // README_CACHE[addonId] = data;

    // return data;

    return new Promise(resolve => {
        https.get(`https://${WEB_HOSTNAME}/${type}?id=${addonId}`, res => {
            try {
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                res.on("end", () => {
                    try {
                        const rawHTML = chunks.join("");
                        const parsed = Object.assign(document.createElement("div"), {
                            innerHTML: rawHTML
                        });
                        const [readme] = parsed.getElementsByClassName("markdown-body");
                        README_CACHE[addonId] = readme.innerHTML;
                        resolve(readme.innerHTML);
                    }
                    catch (error) {
                        console.error(error);
                    }
                });
                res.on("error", console.error);
            }
            catch (error) {
                console.error(error);
            }
        });
    });
}