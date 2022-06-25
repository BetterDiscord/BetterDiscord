import Utilities from "./utilities";
import ClassName from "../structs/classname";
import WebpackModules from "./webpackmodules";

const combineClasses = function (...props) {
    return Object.assign({}, ...props.map(prop => WebpackModules.getByProps(...prop)));
};

const DiscordClassModules = Utilities.memoizeObject({
    get Text() {
        return combineClasses(
            ["size20", "size12"],
            ["selectable", "colorMuted"]
        );
    },
    get Titles() {
        return combineClasses(
            ["wrapper", "base"],
            ["defaultColor", "h4"]
        );
    },
    get EmptyImage() {return WebpackModules.getByProps("emptyImage", "emptyHeader");},
    get Modal() {return WebpackModules.getByProps("content", "root", "header", "close");},
    get Scrollers() {return WebpackModules.getByProps("thin", "scrollerBase", "content");},
    get Margins() {return WebpackModules.getByProps("marginXSmall", "marginBottom8");},
    get Integrations() {return WebpackModules.getByProps("secondaryHeader", "detailsWrapper");},
    get Card() {return WebpackModules.getByProps("card", "topDivider", "description");},
});

const emptyClassModule = new Proxy({}, {
    get() {return "";}
});

const DiscordClasses = new Proxy(DiscordClassModules, {
    get(list, item) {
        if (list[item] === undefined) return emptyClassModule;
        if (typeof(list[item]) === "string") return list[item];
        
        return new Proxy(list[item], {
            get(obj, prop) {
                if (!Reflect.has(obj, prop)) return "";

                return new ClassName(obj[prop]);
            }
        });
    }
});

export default DiscordClasses;