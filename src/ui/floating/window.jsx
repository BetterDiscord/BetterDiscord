import {React, Strings} from "modules";

import Screen from "../../structs/screen";
import CloseButton from "../icons/close";
import MaximizeIcon from "../icons/fullscreen";
import Modals from "../modals";

export default class FloatingWindow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {modalOpen: false};

        this.offX = 0;
        this.offY = 0;

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
        this.currentWidth = this.window.current.style.width;
        this.currentHeight = this.window.current.style.height;
    }

    onDragStop() {
        document.removeEventListener("mousemove", this.onDrag, true);
        if (this.props.onResize) {
            const width = this.window.current.style.width;
            const height = this.window.current.style.height;
            if (width != this.currentWidth || height != this.currentHeight) this.props.onResize();
            this.currentWidth = width;
            this.currentHeight = height;
        }
    }

    onDragStart(e) {
        const div = this.window.current;
        this.offY = e.clientY - parseInt(div.offsetTop);
        this.offX = e.clientX - parseInt(div.offsetLeft);
        document.addEventListener("mousemove", this.onDrag, true);
    }

    onDrag(e) {
        const div = this.window.current;
        div.style.top = (e.clientY - this.offY) + "px";
        div.style.left = (e.clientX - this.offX) + "px";
    }

    componentWillUnmount() {
        this.titlebar.current.removeEventListener("mousedown", this.onDragStart, false);
        document.removeEventListener("mouseup", this.onDragStop, false);
    }

    render() {
        const top = this.props.center ? (Screen.height / 2) - (this.props.height / 2) : this.props.top;
        const left = this.props.center ? (Screen.width / 2) - (this.props.width / 2) : this.props.left ;
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

    maximize() {
        this.window.current.style.width = "100%";
        this.window.current.style.height = "100%";
        this.window.current.style.top = "20px";
        this.window.current.style.left = "0px";
        if (this.props.onResize) this.props.onResize();
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