import Utilities from "../modules/utilities";

export default class FormattableString extends String {
    format(values) {
        return Utilities.formatString(this, values);
    }
}