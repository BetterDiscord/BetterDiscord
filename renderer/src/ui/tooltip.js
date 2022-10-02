import Logger from "common/logger";
import {DOMManager} from "modules";


const toPx = function(value) {
    return `${value}px`;
};

const styles = ["primary", "info", "success", "warn", "danger"];
const sides = ["top", "right", "bottom", "left"];
 
export default class Tooltip {
    /**
     *
     * @constructor
     * @param {HTMLElement} node - DOM node to monitor and show the tooltip on
     * @param {string|HTMLElement} tip - string to show in the tooltip
     * @param {object} options - additional options for the tooltip
     * @param {"primary"|"info"|"success"|"warn"|"danger"} [options.style="primary"] - correlates to the discord styling/colors
     * @param {"top"|"right"|"bottom"|"left"} [options.side="top"] - can be any of top, right, bottom, left
     * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
     * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
     */
    constructor(node, text, options = {}) {
        const {style = "primary", side = "top", preventFlip = false, disabled = false} = options;
        this.node = node;
        this.label = text;
        this.style = style.toLowerCase();
        this.side = side.toLowerCase();
        this.preventFlip = preventFlip;
        this.disabled = disabled;
        this.active = false;
 
        if (!sides.includes(this.side)) return Logger.err("Tooltip", `Side ${this.side} does not exist.`);
        if (!styles.includes(this.style)) return Logger.err("Tooltip", `Style ${this.style} does not exist.`);
 
        this.element = DOMManager.parseHTML(`<div class="bd-layer">`);
        this.tooltipElement = DOMManager.parseHTML(`<div class="bd-tooltip"><div class="bd-tooltip-pointer"></div><div class="bd-tooltip-content"></div></div>`);
        this.tooltipElement.classList.add(`bd-tooltip-${this.style}`);

        this.labelElement = this.tooltipElement.childNodes[1];
        if (text instanceof HTMLElement) this.labelElement.append(text);
        else this.labelElement.textContent = text;

        this.element.append(this.tooltipElement); 
 
        this.node.addEventListener("mouseenter", () => {
            if (this.disabled) return;
            this.show();
        });
 
        this.node.addEventListener("mouseleave", () => {
            this.hide();
        });
    }
 
    /** Alias for the constructor */
    static create(node, text, options = {}) {return new Tooltip(node, text, options);}
 
    /** Container where the tooltip will be appended. */
    get container() {return document.querySelector(`#app-mount`);}
    /** Boolean representing if the tooltip will fit on screen above the element */
    get canShowAbove() {return this.node.getBoundingClientRect().top - this.element.offsetHeight >= 0;}
    /** Boolean representing if the tooltip will fit on screen below the element */
    get canShowBelow() {return this.node.getBoundingClientRect().top + this.node.offsetHeight + this.element.offsetHeight <= DOMManager.screenHeight;}
    /** Boolean representing if the tooltip will fit on screen to the left of the element */
    get canShowLeft() {return this.node.getBoundingClientRect().left - this.element.offsetWidth >= 0;}
    /** Boolean representing if the tooltip will fit on screen to the right of the element */
    get canShowRight() {return this.node.getBoundingClientRect().left + this.node.offsetWidth + this.element.offsetWidth <= DOMManager.screenWidth;}
 
    /** Hides the tooltip. Automatically called on mouseleave. */
    hide() {
        /** Don't rehide if already inactive */
        if (!this.active) return;
        this.active = false;
        this.element.remove();
    }
 
    /** Shows the tooltip. Automatically called on mouseenter. Will attempt to flip if position was wrong. */
    show() {
        /** Don't reshow if already active */
        if (this.active) return;
        this.active = true;
        this.labelElement.textContent = this.label;
        this.container.append(this.element);
 
        if (this.side == "top") {
            if (this.canShowAbove || (!this.canShowAbove && this.preventFlip)) this.showAbove();
            else this.showBelow();
        }
 
        if (this.side == "bottom") {
            if (this.canShowBelow || (!this.canShowBelow && this.preventFlip)) this.showBelow();
            else this.showAbove();
        }
 
        if (this.side == "left") {
            if (this.canShowLeft || (!this.canShowLeft && this.preventFlip)) this.showLeft();
            else this.showRight();
        }
 
        if (this.side == "right") {
            if (this.canShowRight || (!this.canShowRight && this.preventFlip)) this.showRight();
            else this.showLeft();
        }
 
        /** Do not create a new observer each time if one already exists! */
        if (this.observer) return;
        /** Use an observer in show otherwise you'll cause unclosable tooltips */
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const nodes = Array.from(mutation.removedNodes);
                const directMatch = nodes.indexOf(this.node) > -1;
                const parentMatch = nodes.some(parent => parent.contains(this.node));
                if (directMatch || parentMatch) {
                    this.hide();
                    this.observer.disconnect();
                }
            });
        });
 
        this.observer.observe(document.body, {subtree: true, childList: true});
    }
 
    /** Force showing the tooltip above the node. */
    showAbove() {
        this.tooltipElement.classList.add("bd-tooltip-top");
        this.element.style.setProperty("top", toPx(this.node.getBoundingClientRect().top - this.element.offsetHeight - 10));
        this.centerHorizontally();
    }
 
    /** Force showing the tooltip below the node. */
    showBelow() {
        this.tooltipElement.classList.add("bd-tooltip-bottom");
        this.element.style.setProperty("top", toPx(this.node.getBoundingClientRect().top + this.node.offsetHeight + 10));
        this.centerHorizontally();
    }
 
    /** Force showing the tooltip to the left of the node. */
    showLeft() {
        this.tooltipElement.classList.add("bd-tooltip-left");
        this.element.style.setProperty("left", toPx(this.node.getBoundingClientRect().left - this.element.offsetWidth - 10));
        this.centerVertically();
    }
 
    /** Force showing the tooltip to the right of the node. */
    showRight() {
        this.tooltipElement.classList.add("bd-tooltip-right");
        this.element.style.setProperty("left", toPx(this.node.getBoundingClientRect().left + this.node.offsetWidth + 10));
        this.centerVertically();
    }
 
    centerHorizontally() {
        const nodecenter = this.node.getBoundingClientRect().left + (this.node.offsetWidth / 2);
        this.element.style.setProperty("left", toPx(nodecenter - (this.element.offsetWidth / 2)));
    }
 
    centerVertically() {
        const nodecenter = this.node.getBoundingClientRect().top + (this.node.offsetHeight / 2);
        this.element.style.setProperty("top", toPx(nodecenter - (this.element.offsetHeight / 2)));
    }
}

window.Tooltip = Tooltip;