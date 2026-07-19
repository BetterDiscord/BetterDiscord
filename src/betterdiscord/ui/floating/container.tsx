import React from "react";

import FloatingWindow from "./window";
import {useStateFromStores} from "@ui/hooks";
import FloatingWindows from "@ui/floatingwindows";

export default function FloatingWindowContainer() {
    const windows = useStateFromStores(FloatingWindows, () => FloatingWindows.windows, [], true);

    return windows.map(window =>
        <FloatingWindow {...window} onClose={() => FloatingWindows.close(window.id)} key={window.id}>
            {window.children}
        </FloatingWindow>
    );
}