import React from "react";
import ReactUtils from "@api/reactutils";

// type FunctionPatch<P> = (props: P, res: React.ReactNode) => React.ReactNode;
// type ClassPatch<P> = (props: P, res: React.ReactNode, instance: React.Component<P>) => React.ReactNode;
type UnknownPatch<P> = (props: P, res: React.ReactNode, instance?: React.Component<P>) => React.ReactNode;

// This does not allow 2 different things to patch 1 thing!
// Create a new instance for each or make one patch do both things
export default class NodePatcher {
    #id = Symbol("BetterDiscord.NodePatcher");
    #cache = new Map<unknown, React.ComponentType<any>>();
    #destroyed = false;

    public patch<P, T extends React.ComponentType<P> = React.ComponentType<P>>(node: React.ReactElement<P, T>, callback: UnknownPatch<P>) {
        if (this.#destroyed) return;

        const isDestroyed = () => this.#destroyed;

        const type = node.type;

        if (this.#cache.has(type)) {
            node.type = this.#cache.get(type) as T;
            return;
        }

        if ((type as any)[this.#id]) {
            node.type = (type as any)[this.#id];
            return;
        }

        if (type.prototype?.isReactComponent) {
            class ComponentType extends (type as React.ComponentClass<P>) {
                render() {
                    const res = super.render();

                    if (isDestroyed()) return res;

                    const ret = callback(this.props, res, this);

                    if (typeof ret === "undefined") return res;
                    return ret;
                }
            }

            this.#cache.set(type, ComponentType);
            this.#cache.set(ComponentType, ComponentType);

            (ComponentType as any)[this.#id] = ComponentType;

            node.type = ComponentType as T;

            return;
        }

        const FC = ReactUtils.getType<React.FunctionComponent<P>, P>(type as React.FunctionComponent<P>);

        function FunctionType(...args: [props: P]) {
            const res = FC(...args);

            // Basically treat it as if its react 19 component where ref is in props
            const props = args.length === 1 ? args[0] : Object.assign({ref: args[1 as 0]}, args[0]);

            if (res instanceof Promise) {
                return res.then((awaited) => {
                    if (isDestroyed()) return awaited;

                    const ret = (callback as ((_: P, __: React.ReactNode) => React.ReactNode))(props, awaited);

                    if (typeof ret === "undefined") return awaited;
                    return ret;
                });
            }

            if (isDestroyed()) return res;

            const ret = (callback as ((_: P, __: React.ReactNode) => React.ReactNode))(props, res);

            if (typeof ret === "undefined") return res;
            return ret;
        }

        let newType: React.ComponentType<any> = FunctionType;

        if (typeof type === "object") {
            const t = type as any;

            if (t.type) {
                newType = React.memo(t.type?.render ? React.forwardRef(newType as any) : newType as any, t.compare);
            }
            else if (t.render) {
                newType = React.forwardRef(newType as any);
            }
            else if (t._payload) {
                // TODO: Maybe refactor so this isnt so gross
                newType = React.lazy(() => {
                    const out = t._init(t._payload) as React.ComponentType<any> | Promise<never>;

                    const handle = (component: React.ComponentType<any>) => {
                        const fNode = {type: component} as unknown as React.ReactElement<P, T>;

                        this.patch(fNode, callback);

                        return fNode.type;
                    };

                    if (out instanceof Promise) {
                        return out.catch((err: {default: React.ComponentType<any>;}) => {
                            return {
                                "default": handle(err.default)
                            };
                        });
                    }

                    return Promise.resolve({
                        "default": handle(out)
                    });
                });
            }
        }

        for (const propName of ["defaultProps", "displayName", "propTypes"]) {
            const descriptor = Object.getOwnPropertyDescriptor(type, propName);

            if (descriptor) {
                Object.defineProperty(newType, propName, descriptor);
            }
        }

        this.#cache.set(type, newType);
        this.#cache.set(newType, newType);

        (newType as any)[this.#id] = newType;

        node.type = newType as T;
    }

    public destroy() {
        this.#destroyed = true;
    }
};
