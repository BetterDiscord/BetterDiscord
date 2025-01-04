import {version} from "@modules/api/legacy";
import DOMManager from "@modules/dommanager";
import LoadingStyles from "@styles/loading.css";

/** Don't forget to call {@link show} method. */
class ElementManager {

  /** @type {HTMLDivElement} */
  #elementContainer;
  /** @type {HTMLDivElement} */
  #element;

  /**
   * @param {HTMLDivElement} element
   * @param {HTMLDivElement} container
   */
  constructor(element, container) {
    this.#element = element;
    this.#elementContainer = container;
  }

  show() {
    this.#elementContainer.appendChild(this.#element);
  }

  hide() {
    this.#element.remove();
  }
}

/** Don't forget to call {@link show} method. */
class ElementValueManager extends ElementManager {

  /** @type {(value: unknown, element: HTMLDivElement) => void} */
  #changer;

  /**
   * @param {HTMLDivElement} element
   * @param {HTMLDivElement} container
   * @param {(value: unknown, element: HTMLDivElement) => void} changer
   */
  constructor(element, container, changer) {
    super(element, container);
    this.#changer = changer;
  }

  set(value) {
    this.#changer(value);
  }
}

/** Element manager with all loading info elemets. Now we have note and status block with progress bar and status label. Don't forget to call {@link show} and {@link hide} methods. */
class LoadingManager {

  /** @type {HTMLElement} */
  #elementContainer;
  /** @type {HTMLDivElement} */
  #element;

  note;
  status;

  constructor() {
    const layout = DOMManager.createElement("div", {className: "bd-loaderv3"});
    const container = DOMManager.createElement("div", {className: "bd-loading-container", target: layout});

    const leftside = DOMManager.createElement("div", {className: "bd-loading-left-side", target: container});
    DOMManager.createElement("div", {className: "bd-loading-icon", target: leftside});
    DOMManager.createElement("div", {className: "bd-loading-icon-note", target: leftside}, "v" + version);

    const rightside = DOMManager.createElement("div", {className: "bd-loading-right-side", target: container});

    this.#elementContainer = document.body;
    this.#element = layout;
    this.status = new LoadingStatusManager(rightside);
  }

  async show() {
    this.#element.style.pointerEvents = "none";
    DOMManager.injectStyle("bd-loading", LoadingStyles.toString());
    this.#elementContainer.appendChild(this.#element);
    await this.#element.animate([{opacity: 0}, {opacity: 1}], {duration: 500}).finished;
    this.#element.style.pointerEvents = "";
  }

  async hide() {
    this.#element.style.pointerEvents = "none";
    await this.#element.animate([{opacity: 1}, {opacity: 0}], {duration: 500}).finished;
    this.#element.remove();
    DOMManager.removeStyle("bd-loading");
  }

}

/** Status element manager with progress elements, e.g.: progress bar and status label. Don't forget to call {@link show} method. */
class LoadingStatusManager extends ElementManager {

  /** @type {HTMLDivElement} */
  #elementContainer;
  /** @type {HTMLDivElement} */
  #element;
  /** @type {HTMLDivElement} */
  #elementProgress;
  /** @type {HTMLDivElement} */
  #elementProgressBar;
  /** @type {HTMLDivElement} */
  #elementStatus;

  label;
  progress;

  /** @param {HTMLDivElement} container */
  constructor(container) {
    const element = DOMManager.createElement("div", {className: "bd-loading-item"});
    super(element, container);
    this.#elementContainer = container;
    this.#element = element;
    this.#elementProgress = DOMManager.createElement("div", {className: "bd-loading-progress", target: this.#element});
    this.#elementProgressBar = DOMManager.createElement("div", {className: "bd-loading-progress-bar", target: this.#elementProgress});
    this.#elementStatus = DOMManager.createElement("div", {className: "bd-loading-status", target: this.#element});
    this.label = new ElementValueManager(this.#elementStatus, this.#elementContainer, (value) => this.#elementStatus.innerText = value);
    this.progress = new ElementValueManager(this.#elementProgress, this.#elementContainer, (value) => this.#elementProgressBar.style.width = Math.min(Math.max(0, value), 100) + "%");
  }

}

const Loading = new LoadingManager();
export default Loading;