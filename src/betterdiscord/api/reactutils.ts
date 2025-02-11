import DiscordModules from "@modules/discordmodules";
import React from "@modules/react";

interface PatchedReactHooks {
    useMemo<T>(factory: () => T): T;
    useState<T>(initial: T | (() => T)): [T, () => void];
    useReducer<T>(reducer: (state: T, action: any) => T, initial: T): [T, () => void];
    useRef<T>(value?: T): {current: T | null;};
    useCallback<T extends (...args: any[]) => any>(callback: T): T;
    useContext<T>(context: React.Context<T>): T;
    useEffect(): void;
    useLayoutEffect(): void;
    useImperativeHandle(): void;
    useTransition(): [boolean, (callback: () => void) => void];
    useActionState(): void;
    useInsertionEffect(): void;
    useDebugValue(): void;
    useDeferredValue<T>(value: T): T;
    useSyncExternalStore<T>(subscribe: () => void, getSnapshot: () => T): T;
    useId(): string;
}

const patchedReactHooks: PatchedReactHooks = {
    useMemo<T>(factory: () => T) {
        return factory();
    },
    useState<T>(initial: T | (() => T)) {
        if (typeof initial === "function") {
            const initialValue = (initial as () => T)();
            return [initialValue, () => {}];
        }
        return [initial, () => {}];
    },
    useReducer<T>(_reducer: (state: T, action: any) => T, initial: T) {
        return [initial, () => {}];
    },
    useRef<T>(value: T | null = null) {
        return {current: value};
    },
    useCallback<T extends (...args: any[]) => any>(callback: T) {
        return callback;
    },
    useContext<T>(context: React.Context<T>) {
        return context._currentValue as T;
    },
    useEffect() {},
    useLayoutEffect() {},
    useImperativeHandle() {},
    useTransition() {
        return [false, (callback: () => void) => callback()];
    },
    useActionState() {},
    useInsertionEffect() {},
    useDebugValue() {},
    useDeferredValue<T>(value: T) {
        return value;
    },
    useSyncExternalStore<T>(_subscribe: () => void, getSnapshot: () => T) {
        return getSnapshot();
    },
    useId() {
        return Math.random().toString(36).substr(2, 9);
    }
};

interface GetOwnerInstanceOptions {
    include?: string[];
    exclude?: string[];
    filter?: (owner: any) => boolean;
}

interface ReactUtils {
    rootInstance: any;
    getInternalInstance(node: HTMLElement): any | null;
    getOwnerInstance(node: HTMLElement | undefined, options?: GetOwnerInstanceOptions): any | null;
    wrapElement(element: HTMLElement | HTMLElement[]): React.ComponentType;
    wrapInHooks<P extends object>(
        functionComponent: React.FunctionComponent<P>,
        customPatches?: Partial<PatchedReactHooks>
    ): React.FunctionComponent<P>;
}

/**
 * `ReactUtils` is a utility class for interacting with React internals. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for interacting with the internals of the UI.
 * @type ReactUtils
 * @summary {@link ReactUtils} is a utility class for interacting with React internals.
 * @name ReactUtils
 */
const ReactUtils: ReactUtils = {
    get rootInstance() {
        return document.getElementById("app-mount")?._reactRootContainer?._internalRoot?.current;
    },

    /**
     * Gets the internal React data of a specified node.
     *
     * @param {HTMLElement} node Node to get the internal React data from
     * @returns {object|undefined} Either the found data or `undefined`
     */
    getInternalInstance(node: HTMLElement): object | undefined {
        if ((node as any).__reactFiber$) return (node as any).__reactFiber$;
        const key = Object.keys(node).find(
            k => k.startsWith("__reactInternalInstance") || k.startsWith("__reactFiber")
        );
        return key ? (node as any)[key] : null;
    },

    /**
     * Attempts to find the "owner" node to the current node. This is generally
     * a node with a `stateNode` - a class component.
     *
     * @param {HTMLElement} node Node to obtain React instance of
     * @param {object} options Options for the search
     * @param {array} [options.include] List of items to include in the search
     * @param {array} [options.exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]] List of items to exclude from the search.
     * @param {callable} [options.filter=_=>_] Filter to check the current instance with (should return a boolean)
     * @return {object|undefined} The owner instance or `undefined` if not found
     */
    getOwnerInstance(node: HTMLElement | undefined, {
        include,
        exclude = ["Popout", "Tooltip", "Scroller", "BackgroundFlash"],
        filter = () => true
    }: GetOwnerInstanceOptions = {}): object | undefined | null {
        if (!node) return null;
        const excluding = include === undefined;
        const nameFilter = excluding ? exclude : include;

        function getDisplayName(owner: any) {
            const type = owner.type;
            if (!type) return null;
            return type.displayName || type.name || null;
        }

        function classFilter(owner: any) {
            const name = getDisplayName(owner);
            return name !== null && (nameFilter?.includes(name) !== excluding);
        }

        let curr = this.getInternalInstance(node);
        while (curr && curr.return) {
            curr = curr.return;
            const owner = curr.stateNode;
            if (owner && !(owner instanceof HTMLElement) && classFilter(curr) && filter(owner)) {
                return owner;
            }
        }

        return null;
    },

    /**
     * Creates an unrendered React component that wraps HTML elements.
     *
     * @param {HTMLElement} element Element or array of elements to wrap
     * @returns {object} Unrendered React component
     */
    wrapElement(element: HTMLElement | HTMLElement[]) {
        return class ReactWrapper extends React.Component {
            element: HTMLElement | HTMLElement[];
            state: {hasError: boolean;};

            constructor(props: any) {
                super(props);
                this.element = element;
                this.state = {hasError: false};
            }

            componentDidCatch() {
                this.setState({hasError: true});
            }

            componentDidMount() {
                const refElement = (this.refs as any).element;
                if (Array.isArray(this.element)) {
                    this.element.forEach(el => refElement.appendChild(el));
                }
                else {
                    refElement.appendChild(this.element);
                }
            }

            render() {
                return this.state.hasError ? null : DiscordModules.React.createElement("div", {
                    className: "react-wrapper",
                    ref: "element"
                });
            }
        };
    },

    wrapInHooks<P extends object>(
        functionComponent: React.FunctionComponent<P>,
        customPatches: Partial<PatchedReactHooks> = {}
    ) {
        return function wrappedComponent(props: P, context: any) {
            const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
            const reactDispatcher = reactInternals.ReactCurrentDispatcher.current;
            const originalDispatcher = {...reactDispatcher};

            Object.assign(reactDispatcher, patchedReactHooks, customPatches);

            try {
                return functionComponent(props, context);
            }
            // eslint-disable-next-line no-useless-catch
            catch (error) {
                throw error;
            }
            finally {
                Object.assign(reactDispatcher, originalDispatcher);
            }
        };
    }
};

Object.freeze(ReactUtils);

export default ReactUtils;