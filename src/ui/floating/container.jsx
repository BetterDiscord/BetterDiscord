import {React, DOM} from "modules";

import FloatingWindow from "./window";

class FloatingWindowContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {windows: []};
    }

    get minY() {
        const appContainer = DOM.query(`#app-mount > div[class*="app-"]`);
        if (appContainer) return appContainer.offsetTop;
        return 0;
    }

    render() {
        return this.state.windows.map(window =>
            <FloatingWindow {...window} close={this.close.bind(this, window.id)} minY={this.minY}>
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

export default FloatingWindowContainer;