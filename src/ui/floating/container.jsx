import {React, Utilities} from "modules";

import FloatingWindow from "./window";

class FloatingWindowContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {windows: []};
    }

    render() {
        return this.state.windows.map(window =>
            // <FloatingWindow onResize={window.onResize} close={this.close.bind(this, window.id)} title={window.title} id={window.id} height={window.height} width={window.width} center={window.center} resizable={window.resizable}>
            <FloatingWindow {...window} close={this.close.bind(this, window.id)}>
                    {window.children}
            </FloatingWindow>
        );
    }

    open(window) {
        this.setState({
            windows: [...this.state.windows, window]
        });
        // this.windows.push(window);
        // this.forceUpdate();
    }

    close(id) {
        this.setState({
            windows: this.state.windows.filter(w => {
                if (w.id == id && w.onClose) w.onClose();
                return w.id != id;
            })
        });
        // const index = this.windows.findIndex(w => w.id == id);
        // if (index < 0) return;
        // this.windows.splice(index, 1);
        // this.forceUpdate();
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
const container = <FloatingWindowContainer ref={containerRef} />;
// ReactDOM.render(container, FloatingWindowContainer.root);
const App = document.querySelector(".app-19_DXt").__reactInternalInstance$.return.return.return.return.return.return.return.return.return.return.return;
Utilities.monkeyPatch(App.type.prototype, "render", {after: (data) => {
    //returnValue.props.children.props.children.props.children.props.children[4].props.children.props.children[1].props.children
    data.returnValue.props.children.props.children.props.children.props.children[4].props.children.props.children[1].props.children.push(container);
}});
App.stateNode.forceUpdate();
export default containerRef.current;

// patch App component
//
//document.querySelector(".app-19_DXt").__reactInternalInstance$.return.return.return.return.return.return.return.return.return.type
//props.children.props.children.props.children.props.children[4].props.children[1].props.children[""0""].push( SELF )
// forceupdate app component