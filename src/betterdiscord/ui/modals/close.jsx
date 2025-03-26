import React from "@modules/react";

import {XIcon} from "lucide-react";
import Button from "../base/button";


export default function CloseButton({onClick}) {
    return <Button
        className="bd-close-button"
        size={Button.Sizes.ICON}
        look={Button.Looks.BLANK}
        color={Button.Colors.TRANSPARENT}
        onClick={onClick}
    >
        <XIcon size="24px" />
    </Button>;
}
