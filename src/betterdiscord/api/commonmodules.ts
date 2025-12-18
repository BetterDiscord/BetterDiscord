import data from "../webpack/modules.json" with {type: "json"};
import {Filters, getBulkKeyed} from "@webpack";

function buildQueries(modules) {
    const queries = {};

    for (const module of modules) {
        for (const [key, value] of Object.entries(module)) {
            const query = {
                ...value,
                filter: value.type === "byKeys"
                    ? Filters[value.type](value.properties)
                    : Filters[value.type](...value.properties)
            };

            if (value.map) {
                query.map = {};
                for (const [mapKey, mapValue] of Object.entries(value.map)) {
                    const mapType = mapValue.type;
                    const mapProps = mapValue.properties;

                    if (mapType === "byKeys") {
                        query.map[mapKey] = Filters.byKeys(mapProps);
                    }
                    else if (mapType === "byStrings") {
                        query.map[mapKey] = Filters.byStrings(...mapProps);
                    }
                }
            }

            queries[key] = query;
        }
    }

    return queries;
}

function organizeBySpace(modules, result) {
    const spaces = {};

    for (const module of modules) {
        for (const [key, value] of Object.entries(module)) {
            if (value.space) {
                if (!spaces[value.space]) {
                    spaces[value.space] = {};
                }
                spaces[value.space][key] = result[key];
            }
        }
    }

    return spaces;
}

function parser() {
    const queries = buildQueries(data);
    const result = getBulkKeyed(queries);
    return organizeBySpace(data, result);
}

async function refetch(moduleToBeParsed: string) {
    const fetchedData = await fetch(moduleToBeParsed).then(res => res.json());
    const queries = buildQueries(fetchedData);
    const result = getBulkKeyed(queries);
    return organizeBySpace(fetchedData, result);
}

const retData = parser();
const CommonModules = Object.freeze(retData);

export default {refetch, CommonModules};