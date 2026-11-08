import type {Webpack} from "../types/discord";

export function mapObject<T extends object>(...args: [...modules: any[], mappers: Record<keyof T, Webpack.ExportedOnlyFilter>]): T {
    const mappers = args.pop()!;
    const modules = args;

    const mapped = Object.create(null) as Partial<T>;
    const mapperKeys = Object.keys(mappers) as Array<keyof T>;

    for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const moduleKeys = Object.keys(module);

        for (let j = 0; j < moduleKeys.length; j++) {
            const searchKey = moduleKeys[j];
            if (!Object.prototype.hasOwnProperty.call(module, searchKey)) continue;

            for (let k = 0; k < mapperKeys.length; k++) {
                const key = mapperKeys[k];
                if (!Object.prototype.hasOwnProperty.call(mappers, key)) continue;
                if (Object.prototype.hasOwnProperty.call(mapped, key)) continue;

                if (mappers[key](module[searchKey])) {
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
        value: {modules, mappers},
        configurable: false
    });

    // Maybe switch to a proxy?
    return mapped as T;
}