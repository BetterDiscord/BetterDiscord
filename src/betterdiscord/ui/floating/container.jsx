import React from "@modules/react";
import Events from "@modules/emitter";

import FloatingWindow from "./window";

const {useState, useCallback, useEffect} = React;


function minY() {
    const appContainer = document.querySelector(`#app-mount > div[class*="app-"]`);
    if (appContainer) return appContainer.offsetTop;
    return 0;
}

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
        <FloatingWindow {...window} close={() => close(window.id)} minY={minY()} key={window.id}>
                {window.children}
        </FloatingWindow>
    );
}