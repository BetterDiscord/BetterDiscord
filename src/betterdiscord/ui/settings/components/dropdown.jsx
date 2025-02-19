import React from "@modules/react";
import {none, SettingsContext} from "@ui/contexts";
import {ChevronDown} from "lucide-react";

const {useState, useCallback, useContext} = React;


export default function Select({value: initialValue, options, style, onChange, disabled}) {
    const [internalValue, setValue] = useState(initialValue ?? options[0].value);
    const contextValue = useContext(SettingsContext);

    const value = contextValue !== none ? contextValue : internalValue;

    const change = useCallback((val) => {
        onChange?.(val);
        setValue(val);
    }, [onChange]);


    const hideMenu = useCallback(() => {
        setOpen(false);
        document.removeEventListener("click", hideMenu);
    }, []);

    const [open, setOpen] = useState(false);
    const showMenu = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();

        if (disabled) return;

        const next = !open;
        setOpen(next);
        if (!next) return;
        document.addEventListener("click", hideMenu);
    }, [hideMenu, open, disabled]);


    // ?? options[0] provides a double failsafe
    const selected = options.find(o => o.value == value) ?? options[0];
    const optionComponents = <div className="bd-select-options">
            {options.map(opt =>
                <div className={`bd-select-option${selected.value == opt.value ? " selected" : ""}`} onClick={() => change(opt.value)}>{opt.label}</div>
            )}
        </div>;

    const styleClass = style == "transparent" ? " bd-select-transparent" : "";
    const isOpen = open ? " menu-open" : "";
    const isDisabled = disabled ? " bd-select-disabled" : "";
    return <div className={`bd-select${styleClass}${isOpen}${isDisabled}`} onClick={showMenu}>
                <div className="bd-select-value">{selected.label}</div>
                <ChevronDown size="16px" className="bd-select-arrow" />
                {open && optionComponents}
            </div>;
}