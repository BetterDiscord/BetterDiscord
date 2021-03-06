import DiscordModules from "./discordmodules";
import Patcher from "./patcher";

const React = DiscordModules.React;
const components = {};
const unknownComponents = new Set();
const listeners = new Set();

export default new class ReactComponents {

    get named() {return components;}
    get unknown() {return unknownComponents;}
    get listeners() {return listeners;}

    constructor() {
        Patcher.after("ReactComponents", React, "createElement", (_, __, returnValue) => {
            this.walkRenderTree(returnValue);
        });
        Patcher.instead("ReactComponents", React.Component.prototype, "componentWillMount", (thisObject) => {
            this.addComponent(thisObject.constructor);
        });
        Patcher.instead("ReactComponents", React.Component.prototype, "UNSAFE_componentWillMount", (thisObject) => {
            this.addComponent(thisObject.constructor);
        });

        Patcher.instead("ReactComponents", React.PureComponent.prototype, "componentWillMount", (thisObject) => {
            this.addComponent(thisObject.constructor);
        });
        Patcher.instead("ReactComponents", React.PureComponent.prototype, "UNSAFE_componentWillMount", (thisObject) => {
            this.addComponent(thisObject.constructor);
        });
    }

    initialize() {
        this.walkReactTree(document.querySelector("#app-mount")._reactRootContainer._internalRoot.current);
    }

    get(name, filter) {
        return new Promise(resolve => {
            if (components[name]) return resolve(components[name]);
            listeners.add({name, filter, resolve});
            if (!filter) return;
            for (const component of unknownComponents) {
                if (!filter(component)) continue;
                component.displayName = name;
                unknownComponents.delete(component);
                this.addNamedComponent(component);
            }
        });
    }

    addNamedComponent(component) {
        const name = component.displayName;
        if (!components[name]) {
            components[name] = component;
            for (const listener of listeners) {
                if (listener.name !== name) continue;
                listener.resolve(component);
                listeners.delete(listener);
            }
        }
    }

    addUnknownComponent(component) {
        if (unknownComponents.has(component)) return;
        for (const listener of listeners) {
            if (!listener.filter || !listener.filter(component)) continue;
            component.displayName = listener.name;
            this.addNamedComponent(component);
        }
        if (!component.displayName) unknownComponents.add(component);
    }

    addComponent(component) {
        if (component.displayName) return this.addNamedComponent(component);
        return this.addUnknownComponent(component);
    }

    walkRenderTree(tree) {
        if (!tree) return;
        if (typeof(tree.type) == "function") this.addComponent(tree.type);
        if (Array.isArray(tree)) for (const value of tree) this.walkRenderTree(value);
        if (tree.props && tree.props.children) this.walkRenderTree(tree.props.children);
    }

    walkReactTree(tree) {
        if (!tree) return;
        if (typeof(tree.type) == "function") this.addComponent(tree.type);
        if (tree.child) this.walkReactTree(tree.child);
        if (tree.sibling) this.walkReactTree(tree.sibling);
    }
};