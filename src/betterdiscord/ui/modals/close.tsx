import React from "@modules/react";

import Button from "../base/button";
import {XIcon} from "lucide-react";


export default function CloseButton({onClick}: {onClick?: () => void;}) {
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