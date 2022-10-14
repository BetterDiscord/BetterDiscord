import {React, Utilities} from "modules";

export const Type = {
    WANDERING_CUBES: "wandering-cubes",
    CHASING_DOTS: "chasing-dots",
    PULSING_ELLIPSIS: "pulsing-ellipsis",
    SPINNING_CIRCLE: "spinning-circle",
    LOW_MOTION: "low-motion"
};

export default class Spinner extends React.Component {
    static get Type() {return Type;}

    renderItems(type) {
        if (type !== Type.SPINNING_CIRCLE) {
            const itemAmount = type === Type.LOW_MOTION || type === Type.PULSING_ELLIPSIS ? 3 : 2;
            return Array.from({length: itemAmount}).map(() => <span className="bd-spinner-item" />);
        }
        return <svg className="bd-spinner-circular" viewBox="25 25 50 50">
            {Array.from({length: 3}).map(() => <circle cx="50" cy="50" r="20" />)}
        </svg>;
    }

    render() {
        const {className, type = Type.WANDERING_CUBES, ...props} = this.props;

        return <div className={Utilities.className("bd-spinner", `bd-spinner-${type}`, className)} {...props}>
            <span className="bd-spinner-inner">
                {this.renderItems(type)}
            </span>
        </div>;
    }
}