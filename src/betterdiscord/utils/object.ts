import type {Webpack} from "../types/discord";

export function mapObject<T extends object>(module: any, mappers: Record<keyof T, Webpack.ExportedOnlyFilter>): T {
    const mapped = Object.create(null) as Partial<T>;

    const moduleKeys = Object.keys(module);
    const mapperKeys = Object.keys(mappers) as Array<keyof T>;

    for (let i = 0; i < moduleKeys.length; i++) {
        const searchKey = moduleKeys[i];
        if (!Object.prototype.hasOwnProperty.call(module, searchKey)) continue;

        for (let j = 0; j < mapperKeys.length; j++) {
            const key = mapperKeys[j];
            if (!Object.prototype.hasOwnProperty.call(mappers, key)) continue;
            if (Object.prototype.hasOwnProperty.call(mapped, key)) continue;

            if (mappers[key](module[searchKey], searchKey)) {
                Object.defineProperty(mapped, key, {
                    get() {
                        return module[searchKey];
                    },
                    set(value) {
                        module[searchKey] = value;
                    },
                    enumerable: true,
                    configurable: false
                });
            }
        }
    }

    for (let i = 0; i < mapperKeys.length; i++) {
        const key = mapperKeys[i];
        if (!Object.prototype.hasOwnProperty.call(mapped, key)) {
            Object.defineProperty(mapped, key, {
                value: undefined,
                enumerable: true,
                configurable: false
            });
        }
    }

    Object.defineProperty(mapped, Symbol("betterdiscord.mapObject"), {
        value: {module, mappers},
        configurable: false
    });

    // Maybe switch to a proxy?
    return mapped as T;
}