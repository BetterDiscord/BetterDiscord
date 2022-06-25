// import Selector from "./selector";

/** 
 * Representation of a Class Name
 * @memberof module:DOMTools
 **/
class ClassName {
    /**
     * 
     * @param {string} name - name of the class to represent
     */
    constructor(name) {
        this.value = name;
    }
    
    /**
     * Concatenates new class names to the current one using spaces.
     * @param {string} classNames - list of class names to add to this class name
     * @returns {ClassName} returns self to allow chaining
     */
    add(...classNames) {
        for (let i = 0; i < classNames.length; i++) this.value += " " + classNames[i];
        return this;
    }
    
    /**
     * Returns the raw class name, this is how native function get the value.
     * @returns {string} raw class name.
     */
    toString() {
        return this.value;
    }
    
    /**
     * Returns the raw class name, this is how native function get the value.
     * @returns {string} raw class name.
     */
    valueOf() {
        return this.value;
    }
    
    // /**
    //  * Returns the classname represented as {@link module:DOMTools.Selector}.
    //  * @returns {Selector} selector representation of this class name.
    //  */
    // get selector() {
    //     return new Selector(this.value);
    // }

    get single() {
        return this.value.split(" ")[0];
    }

    get first() {
        return this.value.split(" ")[0];
    }
}

export default ClassName;