import ReactUtils from "@api/reactutils";
import Patcher from "@modules/patcher";

/* Skamt Code */
export function reRender(selector: string) {
    const target = document.querySelector(selector)?.parentElement;
    if (!target) return;
    const instance = ReactUtils.getOwnerInstance(target);
    const unpatch = Patcher.instead("BetterDiscord-ReRender", instance, "render", () => unpatch());
    instance.forceUpdate(() => instance.forceUpdate());
}