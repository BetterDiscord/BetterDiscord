import React from "@modules/react";
import Events from "@modules/emitter";

import FloatingWindow from "./window";

const {useState, useCallback, useEffect} = React;

export default function FloatingWindowContainer() {
    const [windows, setWindows] = useState([]);
    const open = useCallback(window => {
        setWindows(wins => [...wins, window]);
    }, []);
    const close = useCallback(id => {
        setWindows(windows.filter(w => {
            if (w.id === id && w.onClose) w.onClose();
            return w.id !== id;
        }));
    }, [windows]);

    useEffect(() => {
        Events.on("open-window", open);
        return () => Events.off("open-window", open);
    }, [open]);

    return windows.map(window =>
        <FloatingWindow {...window} close={() => close(window.id)} key={window.id}>
            {window.children}
        </FloatingWindow>
    );
}