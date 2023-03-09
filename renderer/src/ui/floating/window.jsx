import {React, Strings} from "modules";

import Screen from "../../structs/screen";
import CloseButton from "../icons/close";
import MaximizeIcon from "../icons/fullscreen";
import Modals from "../modals";

const {useState, useCallback, useEffect, useRef, useMemo} = React;


function confirmClose(confirmationText) {
    return new Promise(resolve => {
        Modals.showConfirmationModal(Strings.Modals.confirmAction, confirmationText, {
            danger: true,
            confirmText: Strings.Modals.close,
            onConfirm: () => {resolve(true);},
            onCancel: () => {resolve(false);}
        });
    });
}

export default function FloatingWindow(props) {
    const [modalOpen, setOpen] = useState(false);
    const [isDragging, setDragging] = useState(false);
    const [position, setPosition] = useState({x: props.center ? (Screen.width / 2) - (props.width / 2) : props.left, y: props.center ? (Screen.height / 2) - (props.height / 2) : props.top});
    const [offset, setOffset] = useState({x: 0, y: 0});
    const [size, setSize] = useState({width: 0, height: 0});

    const minX = useMemo(() => props.minX || 0);
    const maxX = useMemo(() => props.maxX || Screen.width);
    const minY = useMemo(() => props.minY || 0);
    const maxY = useMemo(() => props.maxY || Screen.height);

    const titlebar = useRef(null);
    const window = useRef(null);


    const onResizeStart = useCallback(() => {
        setSize({width: window.current.offsetWidth, height: window.current.offsetHeight});
    }, [window]);


    const onDrag = useCallback((e) => {
        if (!isDragging) return;
        let newTop = (e.clientY - offset.y);
        if (newTop <= minY) newTop = minY;
        if (newTop + size.height >= maxY) newTop = maxY - size.height;

        let newLeft = (e.clientX - offset.x);
        if (newLeft <= minX) newLeft = minX;
        if (newLeft + size.width >= maxX) newLeft = maxX - size.width;

        setPosition({x: newLeft, y: newTop});
    }, [window, offset, size, isDragging]);


    const onDragStart = useCallback((e) => {
        const div = window.current;
        setOffset({x: e.clientX - parseInt(div.offsetLeft), y: e.clientY - parseInt(div.offsetTop)});
        setDragging(true);
    }, [window]);


    const onDragStop = useCallback(() => {
        setDragging(false);
        const width = window.current.offsetWidth;
        const height = window.current.offsetHeight;
        if (width != size.width || height != size.height) {
            if (props.onResize) props.onResize();
            const left = parseInt(window.current.style.left);
            const top = parseInt(window.current.style.top);
            if (left + width >= maxX) window.current.style.width = (maxX - left) + "px";
            if (top + height >= maxY) window.current.style.height = (maxY - top) + "px";
        }

        setSize({width, height});
    }, [window, size, onDrag]);


    useEffect(() => {
        window.current.addEventListener("mousedown", onResizeStart, false);
        titlebar.current.addEventListener("mousedown", onDragStart, false);
        document.addEventListener("mouseup", onDragStop, false);
        document.addEventListener("mousemove", onDrag, true);

        return () => {
            document.removeEventListener("mouseup", onDragStop, false);
            document.removeEventListener("mousemove", onDrag, true);
            window?.current?.removeEventListener("mousedown", onResizeStart, false);
            titlebar?.current?.removeEventListener("mousedown", onDragStart, false);
        };
    }, [titlebar, window, onDragStart, onDragStop, onDrag, onResizeStart]);


    const maximize = useCallback(() => {
        window.current.style.width = "100%";
        window.current.style.height = "100%";
        if (props.onResize) props.onResize();

        const width = window.current.offsetWidth;
        const height = window.current.offsetHeight;
        const left = parseInt(window.current.style.left);
        const top = parseInt(window.current.style.top);

        const right = left + width;
        const bottom = top + height;

        // Prevent expanding off the bottom and right and readjust position
        if (bottom > maxY) window.current.style.top = (maxY - height) + "px";
        if (right > maxX) window.current.style.left = (maxX - width) + "px";

        const newLeft = parseInt(window.current.style.left);
        const newTop = parseInt(window.current.style.top);

        // For small screens it's possible pushes us off the other direction... we need to readjust size
        if (newTop < minY) {
            const difference = minY - newTop;
            window.current.style.top = minY + "px";
            window.current.style.height = (height - difference) + "px";
        }
        if (newLeft < minX) {
            const difference = minX - newLeft;
            window.current.style.left = minX + "px";
            window.current.style.height = (width - difference) + "px";
        }
    }, [window, minX, minY, maxX, maxY]);


    const close = useCallback(async () => {
        let shouldClose = true;
        const didConfirmClose = typeof(props.confirmClose) == "function" ? props.confirmClose() : props.confirmClose;
        if (didConfirmClose) {
            setOpen(true);
            shouldClose = await confirmClose(props.confirmationText);
            setOpen(false);
        }
        if (props.close && shouldClose) props.close();
    }, []);



    const className = `floating-window${` ${props.className}` || ""}${props.resizable ? " resizable" : ""}${modalOpen ? " modal-open" : ""}`;
    const styles = {height: props.height, width: props.width, left: position.x || 0, top: position.y || 0};
    return <div id={props.id} className={className} ref={window} style={styles}>
                <div className="floating-window-titlebar" ref={titlebar}>
                    <span className="title">{props.title}</span>
                    <div className="floating-window-buttons">
                        <div className="button maximize-button" onClick={maximize}>
                            <MaximizeIcon size="18px" />
                        </div>
                        <div className="button close-button" onClick={close}>
                            <CloseButton />
                        </div>
                    </div>
                </div>
                <div className="floating-window-content">
                    {props.children}
                </div>
            </div>;
}