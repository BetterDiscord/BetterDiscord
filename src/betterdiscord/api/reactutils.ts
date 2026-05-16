import NodePatcher from "@modules/nodepatcher";
import {getInternalInstance, getOwnerInstance, getType, wrapElement, wrapInHooks} from "@utils/react";

/**
 * `ReactUtils` is a utility class for interacting with React internals. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for interacting with the internals of the UI.
 */
class ReactUtils {
    /**
     * @deprecated
     */
    get rootInstance() {
        return (document.getElementById("app-mount") as any)?._reactRootContainer?._internalRoot?.current;
    }

    getInternalInstance = getInternalInstance;

    /**
     * Attempts to find the "owner" node to the current node. This is generally
     * a node with a `stateNode` - a class component.
     *
     * @param node Node to obtain React instance of
     * @param options Options for the search
     * @returns The owner instance or `undefined` if not found
     */
    getOwnerInstance = getOwnerInstance;

    /**
     * Creates an unrendered React component that wraps HTML elements.
     *
     * @param element Element or array of elements to wrap
     * @returns Unrendered React component
     */
    wrapElement = wrapElement;

    /**
     * Wraps a functional React component to allow it to be created outside of
     * the normal React lifecycle.
     *
     * @param functionComponent The functional component to wrap
     * @param customPatches Custom react hooks to use
     * @returns The wrapped component
     */
    wrapInHooks = wrapInHooks;

    /**
     * Gets the type of a React component, going through things such as forwardRef and memo
     */
    getType = getType;

    /**
     * Creates a NodePatcher instance which is used to patch React nodes
     */
    createNodePatcher() {
        return new NodePatcher();
    }
};

Object.freeze(ReactUtils);
Object.freeze(ReactUtils.prototype);

export default ReactUtils;