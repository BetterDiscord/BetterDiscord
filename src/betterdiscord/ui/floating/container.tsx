import React from "@modules/react";
import Events from "@modules/emitter";

import FloatingWindow, {type FloatingWindowProps} from "./window";

const {useState, useCallback, useEffect} = React;

export default function FloatingWindowContainer() {
    const [windows, setWindows] = useState<FloatingWindowProps[]>([]);
    const open = useCallback((window: FloatingWindowProps) => {
        setWindows(wins => [...wins, window]);
    }, []);
    const close = useCallback((id: string) => {
        setWindows(windows.filter(w => {
            if (w.id === id && w.onClose) w.onClose();
            return w.id !== id;
        }));
    }, [windows]);

    useEffect(() => {
        Events.on("open-window", open);
        return () => void Events.off("open-window", open);
    }, [open]);

    return windows.map(window =>
        <FloatingWindow {...window} onClose={() => close(window.id)} key={window.id}>
            {window.children}
        </FloatingWindow>
    );
}