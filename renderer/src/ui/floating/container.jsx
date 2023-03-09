import {React, Events} from "modules";

import FloatingWindow from "./window";

const {useState, useCallback, useEffect} = React;


function minY() {
    const appContainer = document.querySelector(`#app-mount > div[class*="app-"]`);
    if (appContainer) return appContainer.offsetTop;
    return 0;
}

export default function FloatingWindowContainer() {
    useEffect(() => {
        Events.on("open-window", open);
        return () => Events.off("open-window", open);
    }, []);

    const [windows, setWindows] = useState([]);
    const open = useCallback(window => {
        setWindows([...windows, window]);
    }, [windows]);
    const close = useCallback(id => {
        setWindows(windows.filter(w => {
            if (w.id === id && w.onClose) w.onClose();
            return w.id !== id;
        }));
    }, [windows]);

    return windows.map(window =>
        <FloatingWindow {...window} close={() => close(window.id)} minY={minY()} key={window.id}>
                {window.children}
        </FloatingWindow>
    );
}