import {formatString} from "@common/utils";


const LINK = /\[(.+?)]/;

export default class FormattableString extends String {
    format(values: Record<string, string | object | number | (() => string) | undefined>) {
        return formatString(this as unknown as string, values);
    }

    replaceLink(callback: (s: string) => string) {
        const match = this.match(LINK);
        if (!match) return [this];
        const array = this.split(match[0]);
        const element = callback(match[1]);
        array.splice(1, 0, element);
        return array;
    }
}