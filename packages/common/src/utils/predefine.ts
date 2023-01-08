export default function predefine (target: any, prop: string, effect: Function) {
    const value = target[prop];
    Object.defineProperty(target, prop, {
        get() {return value;},
        set(newValue) {
            Object.defineProperty(target, prop, {
                value: newValue,
                configurable: true,
                enumerable: true,
                writable: true
            });

            try {
                effect(newValue);
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }

            // eslint-disable-next-line no-setter-return
            return newValue;
        },
        configurable: true
    });
};
