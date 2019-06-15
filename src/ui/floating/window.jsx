import {React} from "modules";

import CloseButton from "../icons/close";

class Screen {
    /** Document/window width */
    static get width() { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0); }
    /** Document/window height */
    static get height() { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0); }
}

export default class FloatingWindow extends React.Component {

    constructor(props) {
        super(props);

        this.props.forceTheme = "dont-transform";

        // this.state = {x: 0, y: 0};
        this.offX = 0;
        this.offY = 0;

        this.titlebar = React.createRef();
        this.window = React.createRef();

        this.close = this.close.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragStop = this.onDragStop.bind(this);
        this.onResizeStart = this.onResizeStart.bind(this);
    }

    componentDidMount() {
        if (this.props.isPopout) {
            // console.log(this);
            const popout = this._reactInternalFiber.return.return.return.return.stateNode;//_reactInternalFiber.return.return.return.return.stateNode
            setImmediate(() => {
                document.removeEventListener("click", popout.close, true);
                if (!this.props.close) this.props.close = popout.close;
            });
        }

        this.window.current.addEventListener("mousedown", this.onResizeStart, false);
        this.titlebar.current.addEventListener("mousedown", this.onDragStart, false);
        document.addEventListener("mouseup", this.onDragStop, false);
    }

    onResizeStart() {
        this.currentWidth = this.window.current.style.width;
        this.currentHeight = this.window.current.style.height;
    }

    onDragStop() {
        // e.preventDefault();
        // e.stopPropagation();
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
        // e.preventDefault();
        // e.stopPropagation();

        const div = this.window.current;
        // console.log(div.offsetTop, div.offsetLeft);
        this.offY = e.clientY - parseInt(div.offsetTop);
        this.offX = e.clientX - parseInt(div.offsetLeft);
        document.addEventListener("mousemove", this.onDrag, true);
    }

    onDrag(e) {
        // e.preventDefault();
        // e.stopPropagation();
        const div = this.window.current;
        div.style.position = "fixed";
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
        const className = `floating-window ${this.props.className || ""} ${this.props.resizable ? "resizable" : ""}`;
        const styles = {height: this.props.height, width: this.props.width, left: left || 0, top: top || 0};
        return <div id={this.props.id} className={className} ref={this.window} style={styles}>
                    <div className="floating-window-titlebar" ref={this.titlebar}>
                        <span className="title">{this.props.title}</span>
                        <div className="floating-window-buttons">
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

    close() {
        // console.log("click close");
        if (this.props.close) this.props.close();
    }
}
//target, props (with render), key, event
// function addListeners(){
//     document.getElementById('test').addEventListener('mousedown', mouseDown, false);
//     window.addEventListener('mouseup', mouseUp, false);

// }

// function mouseUp()
// {
//     window.removeEventListener('mousemove', divMove, true);
// }

// function mouseDown(e){
//   var div = document.getElementById('test');
//   offY= e.clientY-parseInt(div.offsetTop);
//   offX= e.clientX-parseInt(div.offsetLeft);
//  window.addEventListener('mousemove', divMove, true);
// }

// function divMove(e){
//     var div = document.getElementById('test');
//   div.style.position = 'absolute';
//   div.style.top = (e.clientY-offY) + 'px';
//   div.style.left = (e.clientX-offX) + 'px';
// }

// const test = {
// animationType: "default",
// arrowAlignment: "top",
// backdrop: false,
// clickPos: 74,
// closeOnScroll: false,
// containerClass: undefined,
// dependsOn: undefined,
// forceTheme: undefined,
// key: "floating-window",
// offsetX: 15,
// offsetY: 0,
// position: "left",
// preventCloseFromModal: false,
// preventClickPropagation: true,
// preventInvert: false,
// render: function() {
//     console.log(arguments);
//     return DiscordModules.React.createElement("div", Object.assign({}, arguments[0], {className: "testme", id: "test"}));
// },
// shadow: false,
// showArrow: false,
// target: $("div.memberOnline-1CIh-0.member-3W1lQa.da-memberOnline.da-member")[0],
// targetHeight: 40,
// targetWidth: 224,
// x: 1211,
// y: 357,
// zIndexBoost: 0
// }

// modaltest = function() {
//     console.log(arguments);
//     return DiscordModules.React.createElement("div", Object.assign({}, arguments[0], {className: "testme", id: "test"}));
// }