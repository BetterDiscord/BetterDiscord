import React from "react";
import ReactUtils from "@api/reactutils";

// type FunctionPatch<P> = (props: P, res: React.ReactNode) => React.ReactNode;
// type ClassPatch<P> = (props: P, res: React.ReactNode, instance: React.Component<P>) => React.ReactNode;
type UnknownPatch<P> = (props: P, res: React.ReactNode, instance?: React.Component<P>) => React.ReactNode;

// This does not allow 2 different things to patch 1 thing!
// Create a new instance for each or make one patch do both things
export default class NodePatcher {
    private id = Symbol("NodePatcher");
    private cache = new Map<unknown, React.ComponentType<any>>();

    public patch<P, T extends React.ComponentType<P> = React.ComponentType<P>>(node: React.ReactElement<P, T>, callback: UnknownPatch<P>) {
        const type = node.type;

        if (this.cache.has(type)) {
            node.type = this.cache.get(type) as T;
            return;
        }

        if ((type as any)[this.id]) {
            node.type = (type as any)[this.id];
            return;
        }

        if (type.prototype?.isReactComponent) {
            class ComponentType extends (type as React.ComponentClass<P>) {
                render() {
                    const res = super.render();

                    return callback(this.props, res, this);
                }
            }

            this.cache.set(type, ComponentType);
            this.cache.set(ComponentType, ComponentType);

            (ComponentType as any)[this.id] = ComponentType;

            node.type = ComponentType as T;

            return;
        }

        const FC = ReactUtils.getType<React.FunctionComponent<P>, P>(type as React.FunctionComponent<P>);

        function FunctionType(props: P) {
            const res = FC(props);

            if (res instanceof Promise) return res;

            return (callback as ((_: P, __: React.ReactNode) => React.ReactNode))(props, res);
        }

        let newType: React.ComponentType<any> = FunctionType;

        if (typeof type === "object") {
            const t = type as any;

            if (t.memo) {
                newType = React.memo(typeof t.type === "object" && t.render ? React.forwardRef(t.render) : t, t.compare);
            }
            else if ((type as any).render) {
                newType = React.forwardRef(t.render);
            }
        }

        for (const propName of ["defaultProps", "displayName", "propTypes"]) {
            const descriptor = Object.getOwnPropertyDescriptor(type, propName);

            if (descriptor) {
                Object.defineProperty(newType, propName, descriptor);
            }
        }

        this.cache.set(type, newType);
        this.cache.set(newType, newType);

        (newType as any)[this.id] = newType;

        node.type = newType as T;
    }
};
