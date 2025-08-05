import React from "@modules/react";
import {t} from "@common/i18n";

import Modals from "@ui/modals";

import {XIcon, MaximizeIcon} from "lucide-react";
import {useLayoutEffect} from "react";

const {useState, useCallback, useEffect, useRef} = React;


function confirmClose(confirmationText: string) {
    return new Promise(resolve => {
        Modals.showConfirmationModal(t("Modals.confirmAction"), confirmationText, {
            danger: true,
            confirmText: t("Modals.close"),
            onConfirm: () => {resolve(true);},
            onCancel: () => {resolve(false);}
        });
    });
}

class Screen {
    /** Document/window width */
    static get width() {return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);}
    /** Document/window height */
    static get height() {return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);}
}

export interface FloatingWindowProps {
    id: string;
    title: React.ReactNode;
    resizable?: boolean;
    children: React.ReactNode;
    className?: string;
    center?: boolean;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    minX?: number;
    minY?: number;
    maxX?: number,
    maxY?: number,
    onResize?(): void;
    onClose?(): void,
    confirmClose?: (() => boolean | Promise<boolean>) | boolean;
    confirmationText?: string;
}

export default function FloatingWindow({id, title, resizable, children, className, center, top: initialTop = 0, left: initialLeft = 0, width: initialWidth = 410, height: initialHeight = 470, minX = 0, minY = 0, maxX = -1, maxY = -1, onResize, onClose, confirmClose: doConfirmClose, confirmationText}: FloatingWindowProps) {
    const [modalOpen, setOpen] = useState(false);

    const max = useRef({x: maxX, y: maxY});
    max.current.x = maxX;
    max.current.y = maxY;

    const positioning = useRef({
        offset: {x: 0, y: 0},
        size: {width: 0, height: 0},
        max: {
            get x() {return max.current.x === -1 ? Screen.width : max.current.x;},
            get y() {return max.current.y === -1 ? Screen.height : max.current.y;}
        },
        min: {x: minX, y: minY},
        position: {x: 0, y: 0},
        isDragging: false
    });

    positioning.current.min.x = minX;
    positioning.current.min.y = minY;

    const titlebar = useRef<HTMLDivElement>(null);
    const window = useRef<HTMLDivElement>(null);

    const onResizeStart = useCallback(() => {
        positioning.current.size.width = window.current!.offsetWidth;
        positioning.current.size.height = window.current!.offsetHeight;
    }, [window]);

    const onDrag = useCallback((e: MouseEvent) => {
        if (!positioning.current.isDragging) return;

        let newTop = (e.clientY - positioning.current.offset.y);
        if (newTop <= positioning.current.min.y) newTop = positioning.current.min.y;
        if (newTop + positioning.current.size.height >= positioning.current.max.y) newTop = positioning.current.max.y - positioning.current.size.height;

        let newLeft = (e.clientX - positioning.current.offset.x);
        if (newLeft <= positioning.current.min.x) newLeft = positioning.current.min.x;
        if (newLeft + positioning.current.size.width >= positioning.current.max.x) newLeft = positioning.current.max.x - positioning.current.size.width;

        positioning.current.position.x = newLeft;
        positioning.current.position.y = newTop;

        window.current!.style.left = `${newLeft}px`;
        window.current!.style.top = `${newTop}px`;
    }, []);


    const onDragStart = useCallback((e: MouseEvent) => {
        const div = window.current!;

        positioning.current.offset.x = e.clientX - div.offsetLeft;
        positioning.current.offset.y = e.clientY - div.offsetTop;

        positioning.current.isDragging = true;
    }, [window]);


    const onDragStop = useCallback(() => {
        positioning.current.isDragging = false;

        const width = window.current!.offsetWidth;
        const height = window.current!.offsetHeight;
        if (width != positioning.current.size.width || height != positioning.current.size.height) {
            if (onResize) onResize();
            const left = parseInt(window.current!.style.left);
            const top = parseInt(window.current!.style.top);
            if (left + width >= positioning.current.max.x) window.current!.style.width = (positioning.current.max.x - left) + "px";
            if (top + height >= positioning.current.max.y) window.current!.style.height = (positioning.current.max.y - top) + "px";
        }

        positioning.current.size.width = width;
        positioning.current.size.height = height;

        window.current!.style.left = `${positioning.current.position.x}px`;
        window.current!.style.top = `${positioning.current.position.y}px`;
    }, [window, onResize]);


    useEffect(() => {
        const winRef = window.current!;
        const titleRef = titlebar.current!;

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
        window.current!.style.width = "100%";
        window.current!.style.height = "100%";

        if (onResize) onResize();

        const width = window.current!.offsetWidth;
        const height = window.current!.offsetHeight;
        const left = parseInt(window.current!.style.left);
        const top = parseInt(window.current!.style.top);

        const right = left + width;
        const bottom = top + height;

        // Prevent expanding off the bottom and right and readjust position
        if (bottom > positioning.current.max.y) window.current!.style.top = (positioning.current.max.y - height) + "px";
        if (right > positioning.current.max.x) window.current!.style.left = (positioning.current.max.x - width) + "px";

        const newLeft = parseInt(window.current!.style.left);
        const newTop = parseInt(window.current!.style.top);

        // For small screens it's possible pushes us off the other direction... we need to readjust size
        if (newTop < positioning.current.min.y) {
            const difference = positioning.current.min.y - newTop;
            window.current!.style.top = positioning.current.min.y + "px";
            window.current!.style.height = (height - difference) + "px";
        }
        if (newLeft < positioning.current.min.x) {
            const difference = positioning.current.min.x - newLeft;
            window.current!.style.left = positioning.current.min.x + "px";
            window.current!.style.height = (width - difference) + "px";
        }
    }, [window, onResize]);


    const close = useCallback(async () => {
        let shouldClose = true;
        const didConfirmClose = typeof (doConfirmClose) == "function" ? doConfirmClose() : doConfirmClose;
        if (didConfirmClose) {
            setOpen(true);
            shouldClose = await confirmClose(confirmationText!) as boolean;
            setOpen(false);
        }
        if (onClose && shouldClose) onClose();
    }, [confirmationText, onClose, doConfirmClose]);

    const finalClassname = `floating-window${className ? ` ${className}` : ""}${resizable ? " resizable" : ""}${modalOpen ? " modal-open" : ""}`;

    useLayoutEffect(() => {
        window.current!.style.height = `${initialHeight}px`;
        window.current!.style.width = `${initialWidth}px`;

        positioning.current.position.x = center ? (Screen.width / 2) - (initialWidth / 2) : initialLeft;
        positioning.current.position.y = center ? (Screen.height / 2) - (initialHeight / 2) : initialTop;

        window.current!.style.left = `${positioning.current.position.x}px`;
        window.current!.style.top = `${positioning.current.position.y}px`;
    }, [center, initialHeight, initialLeft, initialTop, initialWidth]);

    return <div id={id} className={finalClassname} ref={window}>
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