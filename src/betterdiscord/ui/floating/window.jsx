import React from "@modules/react";
import Strings from "@modules/strings";

import Screen from "@structs/screen";

import Modals from "@ui/modals";

import {XIcon, MaximizeIcon} from "lucide-react";

const {useState, useCallback, useEffect, useRef} = React;


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

export default function FloatingWindow({id, title, resizable, children, className, center, top: initialTop, left: initialLeft, width: initialWidth, height: initialHeight, minX = 0, minY = 0, maxX = Screen.width, maxY = Screen.height, onResize, close: doClose, confirmClose: doConfirmClose, confirmationText}) {
    const [modalOpen, setOpen] = useState(false);
    const [isDragging, setDragging] = useState(false);
    const [position, setPosition] = useState({x: center ? (Screen.width / 2) - (initialWidth / 2) : initialLeft, y: center ? (Screen.height / 2) - (initialHeight / 2) : initialTop});
    const [offset, setOffset] = useState({x: 0, y: 0});
    const [size, setSize] = useState({width: 0, height: 0});

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
    }, [offset, size, isDragging, minX, minY, maxX, maxY]);


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
            if (onResize) onResize();
            const left = parseInt(window.current.style.left);
            const top = parseInt(window.current.style.top);
            if (left + width >= maxX) window.current.style.width = (maxX - left) + "px";
            if (top + height >= maxY) window.current.style.height = (maxY - top) + "px";
        }

        setSize({width, height});
    }, [window, size, maxX, maxY, onResize]);


    useEffect(() => {
        const winRef = window.current;
        const titleRef = titlebar.current;
        winRef.addEventListener("mousedown", onResizeStart, false);
        titleRef.addEventListener("mousedown", onDragStart, false);
        document.addEventListener("mouseup", onDragStop, false);
        document.addEventListener("mousemove", onDrag, true);

        return () => {
            document.removeEventListener("mouseup", onDragStop, false);
            document.removeEventListener("mousemove", onDrag, true);
            winRef.removeEventListener("mousedown", onResizeStart, false);
            titleRef.removeEventListener("mousedown", onDragStart, false);
        };
    }, [titlebar, window, onDragStart, onDragStop, onDrag, onResizeStart]);


    const maximize = useCallback(() => {
        window.current.style.width = "100%";
        window.current.style.height = "100%";
        if (onResize) onResize();

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
    }, [window, minX, minY, maxX, maxY, onResize]);


    const close = useCallback(async () => {
        let shouldClose = true;
        const didConfirmClose = typeof (doConfirmClose) == "function" ? doConfirmClose() : doConfirmClose;
        if (didConfirmClose) {
            setOpen(true);
            shouldClose = await confirmClose(confirmationText);
            setOpen(false);
        }
        if (doClose && shouldClose) doClose();
    }, [confirmationText, doClose, doConfirmClose]);



    const finalClassname = `floating-window${className ? ` ${className}` : ""}${resizable ? " resizable" : ""}${modalOpen ? " modal-open" : ""}`;
    const styles = {height: initialHeight, width: initialWidth, left: position.x || 0, top: position.y || 0};
    return <div id={id} className={finalClassname} ref={window} style={styles}>
                <div className="floating-window-titlebar" ref={titlebar}>
                    <span className="title">{title}</span>
                    <div className="floating-window-buttons">
                        <div className="button maximize-button" onClick={maximize}>
                            <MaximizeIcon size="16px" />
                        </div>
                        <div className="button close-button" onClick={close}>
                            <XIcon size="16px" />
                        </div>
                    </div>
                </div>
                <div className="floating-window-content">
                    {children}
                </div>
            </div>;
}