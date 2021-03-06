import {React, Strings} from "modules";

import Screen from "../../structs/screen";
import CloseButton from "../icons/close";
import MaximizeIcon from "../icons/fullscreen";
import Modals from "../modals";

// const Draggable = WebpackModules.getByDisplayName("Draggable");
// {
//     "dragAnywhere": true,
//     "className": "pictureInPictureWindow-1B5qSe",
//     "maxX": 1969,
//     "maxY": this.maxY,
//     "onDragStart": "ƒ () {}",
//     "onDrag": "ƒ () {}",
//     "onDragEnd": "ƒ () {}",
//     "children": "<div />",
//     "initialX": 0,
//     "initialY": 0
//   }

export default class FloatingWindow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {modalOpen: false};

        this.offX = 0;
        this.offY = 0;

        this.maxX = this.props.maxX || Screen.width;
        this.maxY = this.props.maxY || Screen.height;
        this.minX = this.props.minX || 0;
        this.minY = this.props.minY || 0;

        this.titlebar = React.createRef();
        this.window = React.createRef();

        this.close = this.close.bind(this);
        this.maximize = this.maximize.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragStop = this.onDragStop.bind(this);
        this.onResizeStart = this.onResizeStart.bind(this);
    }

    componentDidMount() {
        this.window.current.addEventListener("mousedown", this.onResizeStart, false);
        this.titlebar.current.addEventListener("mousedown", this.onDragStart, false);
        document.addEventListener("mouseup", this.onDragStop, false);
    }

    onResizeStart() {
        this.currentWidth = this.window.current.offsetWidth;
        this.currentHeight = this.window.current.offsetHeight;
    }

    onDragStop() {
        document.removeEventListener("mousemove", this.onDrag, true);
        const width = this.window.current.offsetWidth;
        const height = this.window.current.offsetHeight;
        if (width != this.currentWidth || height != this.currentHeight) {
            if (this.props.onResize) this.props.onResize();
            const left = parseInt(this.window.current.style.left);
            const top = parseInt(this.window.current.style.top);
            if (left + width >= this.maxX) this.window.current.style.width = (this.maxX - left) + "px";
            if (top + height >= this.maxY) this.window.current.style.height = (this.maxY - top) + "px";
        }
        this.currentWidth = width;
        this.currentHeight = height;
    }

    onDragStart(e) {
        const div = this.window.current;
        this.offY = e.clientY - parseInt(div.offsetTop);
        this.offX = e.clientX - parseInt(div.offsetLeft);
        document.addEventListener("mousemove", this.onDrag, true);
    }

    onDrag(e) {
        const div = this.window.current;
        let newTop = (e.clientY - this.offY);
        if (newTop <= this.minY) newTop = this.minY;
        if (newTop + this.currentHeight >= this.maxY) newTop = this.maxY - this.currentHeight;

        let newLeft = (e.clientX - this.offX);
        if (newLeft <= this.minX) newLeft = this.minX;
        if (newLeft + this.currentWidth >= this.maxX) newLeft = this.maxX - this.currentWidth;

        div.style.top = newTop + "px";
        div.style.left = newLeft + "px";
    }

    componentWillUnmount() {
        this.titlebar.current.removeEventListener("mousedown", this.onDragStart, false);
        document.removeEventListener("mouseup", this.onDragStop, false);
    }

    render() {
        const top = this.props.center ? (Screen.height / 2) - (this.props.height / 2) : this.props.top;
        const left = this.props.center ? (Screen.width / 2) - (this.props.width / 2) : this.props.left;
        // console.log(top, left);
        const className = `floating-window${` ${this.props.className}` || ""}${this.props.resizable ? " resizable" : ""}${this.state.modalOpen ? " modal-open" : ""}`;
        const styles = {height: this.props.height, width: this.props.width, left: left || 0, top: top || 0};
        return <div id={this.props.id} className={className} ref={this.window} style={styles}>
                    <div className="floating-window-titlebar" ref={this.titlebar}>
                        <span className="title">{this.props.title}</span>
                        <div className="floating-window-buttons">
                            <div className="button maximize-button" onClick={this.maximize}>
                                <MaximizeIcon size="18px" />
                            </div>
                            <div className="button close-button" onClick={this.close}>
                                <CloseButton />
                            </div>
                        </div>
                    </div>
                    <div className="floating-window-content">
                        {this.props.children}
                    </div>
                </div>;
    }

    maximize() {
        this.window.current.style.width = "100%";
        this.window.current.style.height = "100%";
        if (this.props.onResize) this.props.onResize();

        const width = this.window.current.offsetWidth;
        const height = this.window.current.offsetHeight;
        const left = parseInt(this.window.current.style.left);
        const top = parseInt(this.window.current.style.top);

        const right = left + width;
        const bottom = top + height;

        // Prevent expanding off the bottom and right and readjust position
        if (bottom > this.maxY) this.window.current.style.top = (this.maxY - height) + "px";
        if (right > this.maxX) this.window.current.style.left = (this.maxX - width) + "px";

        const newLeft = parseInt(this.window.current.style.left);
        const newTop = parseInt(this.window.current.style.top);

        // For small screens it's possible this pushes us off the other direction... we need to readjust size
        if (newTop < this.minY) {
            const difference = this.minY - newTop;
            this.window.current.style.top = this.minY + "px";
            this.window.current.style.height = (height - difference) + "px";
        }
        if (newLeft < this.minX) {
            const difference = this.minX - newLeft;
            this.window.current.style.left = this.minX + "px";
            this.window.current.style.height = (width - difference) + "px";
        }
    }

    async close() {
        let shouldClose = true;
        const confirmClose = typeof(this.props.confirmClose) == "function" ? this.props.confirmClose() : this.props.confirmClose;
        if (confirmClose) {
            this.setState({modalOpen: true});
            shouldClose = await this.confirmClose();
            this.setState({modalOpen: false});
        }
        if (this.props.close && shouldClose) this.props.close();
    }

    confirmClose() {
        return new Promise(resolve => {
            Modals.showConfirmationModal(Strings.Modals.confirmAction, this.props.confirmationText, {
                danger: true,
                confirmText: Strings.Modals.close,
                onConfirm: () => {resolve(true);},
                onCancel: () => {resolve(false);}
            });
        });
    }
}