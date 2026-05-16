import type {Fiber} from "react-reconciler";
import DiscordModules from "@modules/discordmodules";
import React, {type RefObject} from "react";

/**
 * Gets the internal React data of a specified node.
 *
 * @param node Node to get the internal React data from
 * @returns Either the found data or `undefined`
 */
export function getInternalInstance(node: Element): Fiber | null {
    if (node.__reactFiber$) return node.__reactFiber$;
    const key = Object.keys(node).find(k => k.startsWith("__reactInternalInstance") || k.startsWith("__reactFiber"));
    if (key) return node[key as keyof typeof node] as Fiber;
    return null;
}

interface GetOwnerInstanceOptions {
    /** A list of items to include in the search */
    include?: string[];
    /** A list of items to exclude from the search */
    exclude?: string[];
    /** A filter to check the current instance with (should return a boolean) */
    filter?: (owner: any) => boolean;
}

export function getOwnerInstance(node: Element | undefined, {
    include,
    exclude = ["Popout", "Tooltip", "Scroller", "BackgroundFlash"],
    filter = () => true
}: GetOwnerInstanceOptions = {}): any {
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

    let curr = getInternalInstance(node);
    while (curr && curr.return) {
        curr = curr.return;
        const owner = curr.stateNode;
        if (owner && !(owner instanceof HTMLElement) && classFilter(curr) && filter(owner)) {
            return owner;
        }
    }

    return null;
}

export function wrapElement(element: Element | Element[]) {
    return class ReactWrapper extends React.Component {
        element: Element | Element[];
        state: {hasError: boolean;};
        ref: RefObject<HTMLDivElement | null> = React.createRef();

        constructor(props: any) {
            super(props);
            this.element = element;
            this.state = {hasError: false};
        }

        componentDidCatch() {
            this.setState({hasError: true});
        }

        componentDidMount() {
            const refElement = this.ref?.current;
            if (!refElement) return;
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
                ref: this.ref
            });
        }
    };
}

type ReactElementType<T extends React.FC<P>, P> = T
    | React.MemoExoticComponent<T | React.ForwardRefExoticComponent<T>>
    | React.ForwardRefExoticComponent<T>
    | React.LazyExoticComponent<T | React.MemoExoticComponent<T | React.ForwardRefExoticComponent<T>> | React.ForwardRefExoticComponent<T>>;

const exoticComponents = {
    memo: Symbol.for("react.memo"),
    forwardRef: Symbol.for("react.forward_ref"),
    lazy: Symbol.for("react.lazy")
};

export function getType<T extends React.FC<P>, P>(elementType: ReactElementType<T, P>): T {
    while (true) {
        switch ((elementType as React.MemoExoticComponent<T> | React.ForwardRefExoticComponent<T>).$$typeof) {
            case exoticComponents.memo:
                elementType = (elementType as React.MemoExoticComponent<T>).type;
                break;
            case exoticComponents.forwardRef:
                elementType = (elementType as React.ForwardRefExoticComponent<T> & {render: T;}).render;
                break;
            case exoticComponents.lazy: {
                const _payload = (elementType as any)._payload;

                if (_payload._status === 1) {
                    elementType = _payload._result.default;
                }
                else {
                    // Not possible but just incase
                    elementType = (() => {}) as unknown as T;
                }
                break;
            }
            default:
                return elementType as T;
        }
    }
}

interface PatchedReactHooks {
    use<T>(usable: PromiseLike<T> | React.Context<T>): T;
    useMemo<T>(factory: () => T): T;
    useState<T>(initial: T | (() => T)): [T, () => void];
    useReducer<T>(reducer: (state: T, action: any) => T, initial: T): [T, () => void];
    useRef<T>(value?: T): {current: T | null;};
    useCallback<T extends (...args: any[]) => any>(callback: T): T;
    useContext<T>(context: React.Context<T>): T;
    readContext<T>(context: React.Context<T>): T;
    useEffect(): void;
    useLayoutEffect(): void;
    useImperativeHandle(): void;
    useTransition(): [boolean, (callback: () => void) => void];
    useActionState: typeof React["useActionState"];
    useFormState: typeof React["useActionState"];
    useInsertionEffect(): void;
    useDebugValue(): void;
    useDeferredValue<T>(value: T): T;
    useSyncExternalStore<T>(subscribe: () => void, getSnapshot: () => T): T;
    useId(): string;
    useOptimistic: typeof React["useOptimistic"];
}

const USE_ERR_MSG = "Minified React error #460; visit https://react.dev/errors/460 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";

const NO_RESOLVE = Symbol("no-resolve");

const patchedReactHooks: PatchedReactHooks = {
    use<T>(usable: PromiseLike<T> | React.Context<T>) {
        if (typeof (usable as PromiseLike<T>).then === "function") {
            let value: any = NO_RESOLVE;

            (usable as PromiseLike<T>).then((ret) => {
                value = ret;
            });

            if (value === NO_RESOLVE) throw new Error(USE_ERR_MSG);
            return value;
        }
        return (usable as any)._currentValue as T;
    },
    useFormState<T>(_action: (...args: unknown[]) => void, initialState: Awaited<T>, _permalink?: string): [state: Awaited<T>, dispatch: () => void, isPending: boolean] {
        return [initialState, () => {}, false];
    },
    readContext<T>(context: React.Context<T>) {
        return (context as any)._currentValue as T;
    },
    useOptimistic<T>(passthrough: T): [T, (action: T | ((pendingState: T) => T)) => void] {
        return [passthrough, () => {}];
    },
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
        return (context as any)._currentValue as T;
    },
    useEffect() {},
    useLayoutEffect() {},
    useImperativeHandle() {},
    useTransition() {
        return [false, (callback: () => void) => callback()];
    },
    useActionState<T>(_action: (...args: unknown[]) => void, initialState: Awaited<T>, _permalink?: string): [state: Awaited<T>, dispatch: () => void, isPending: boolean] {
        return [initialState, () => {}, false];
    },
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

export function wrapInHooks<T extends React.FC<P>, P>(
    functionComponent: T | React.MemoExoticComponent<T | React.ForwardRefExoticComponent<T>> | React.ForwardRefExoticComponent<T>,
    customPatches: Partial<PatchedReactHooks> = {}
): React.FunctionComponent<React.ComponentProps<T>> {
    const FC = getType<T, P>(functionComponent);

    return function wrappedComponent(props: React.ComponentProps<T>) {
        const reactDispatcher = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H;
        const originalDispatcher = {...reactDispatcher};

        Object.assign(reactDispatcher, patchedReactHooks, customPatches);

        try {
            return FC(props);
        }
        catch (error) {
            if (error instanceof Error && error.message === USE_ERR_MSG) return;
            throw error;
        }
        finally {
            Object.assign(reactDispatcher, originalDispatcher);
        }
    };
}