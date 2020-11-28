import Styles from "./styles/index.css";

export default () => {
    const stylesheet = document.createElement("style");
    stylesheet.id = "bd-stylesheet";
    stylesheet.textContent = Styles.toString();
    document.head.appendChild(stylesheet);
};