import {React, Utilities, Patcher} from "modules";

import FloatingWindow from "./window";

class FloatingWindowContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {windows: []};
    }

    render() {
        return this.state.windows.map(window =>
            <FloatingWindow {...window} close={this.close.bind(this, window.id)}>
                    {window.children}
            </FloatingWindow>
        );
    }

    open(window) {
        this.setState({
            windows: [...this.state.windows, window]
        });
    }

    close(id) {
        this.setState({
            windows: this.state.windows.filter(w => {
                if (w.id == id && w.onClose) w.onClose();
                return w.id != id;
            })
        });
    }

    static get id() {return "floating-windows";}
    static get root() {
        if (this._root) return this._root;
        const container = document.createElement("div");
        container.id = this.id;
        document.body.append(container);
        return this._root = container;
    }
}

const containerRef = React.createRef();
// const container = <FloatingWindowContainer ref={containerRef} />;
// const App = Utilities.findInReactTree(Utilities.getReactInstance(document.querySelector(".app-19_DXt")), m => m && m.type && m.type.displayName && m.type.displayName == "App");
// Patcher.after("FloatingContainer", App.type.prototype, "render", (thisObject, args, returnValue) => {
//     const group = Utilities.findInRenderTree(returnValue, m => m && m[6] && m[6].type && m[6].type.displayName == "LayerContainer", {walkable: ["children", "props"]});
//     group.push(container);
// });
// App.stateNode.forceUpdate();
export default containerRef.current;