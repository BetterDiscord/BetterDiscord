import Utilities from "../modules/utilities";

const LINK = /\[(.+?)]/;

export default class FormattableString extends String {
    format(values) {
        return Utilities.formatString(this, values);
    }

    replaceLink(callback) {
        const match = this.match(LINK);
        if (!match) return [this];
        const array = this.split(match[0]);
        const element = callback(match[1]);
        array.splice(1, 0, element);
        return array;
    }
}