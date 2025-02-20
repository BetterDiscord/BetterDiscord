import DiscordModules from "@modules/discordmodules";
import React from "@modules/react";
import Settings from "@stores/settings";
import {Stores} from "@webpack";

import Text from "@ui/base/text";
import Button from "../base/button";
import Flex from "../base/flex";
import Switch from "../settings/components/switch";

const {useState, useCallback, useEffect, forwardRef, useMemo, useImperativeHandle} = React;


const languages = ["abap", "abc", "actionscript", "ada", "apache_conf", "asciidoc", "assembly_x86", "autohotkey", "batchfile", "bro", "c_cpp", "c9search", "cirru", "clojure", "cobol", "coffee", "coldfusion", "csharp", "csound_document", "csound_orchestra", "csound_score", "css", "curly", "d", "dart", "diff", "dockerfile", "dot", "drools", "dummy", "dummysyntax", "eiffel", "ejs", "elixir", "elm", "erlang", "forth", "fortran", "ftl", "gcode", "gherkin", "gitignore", "glsl", "gobstones", "golang", "graphqlschema", "groovy", "haml", "handlebars", "haskell", "haskell_cabal", "haxe", "hjson", "html", "html_elixir", "html_ruby", "ini", "io", "jack", "jade", "java", "javascript", "json", "jsoniq", "jsp", "jssm", "jsx", "julia", "kotlin", "latex", "less", "liquid", "lisp", "livescript", "logiql", "lsl", "lua", "luapage", "lucene", "makefile", "markdown", "mask", "matlab", "maze", "mel", "mushcode", "mysql", "nix", "nsis", "objectivec", "ocaml", "pascal", "perl", "pgsql", "php", "pig", "powershell", "praat", "prolog", "properties", "protobuf", "python", "r", "razor", "rdoc", "red", "rhtml", "rst", "ruby", "rust", "sass", "scad", "scala", "scheme", "scss", "sh", "sjs", "smarty", "snippets", "soy_template", "space", "sql", "sqlserver", "stylus", "svg", "swift", "tcl", "tex", "text", "textile", "toml", "tsx", "twig", "typescript", "vala", "vbscript", "velocity", "verilog", "vhdl", "wollok", "xml", "xquery", "yaml", "django"];

function makeButton(button: any, value: any) {
    return <DiscordModules.Tooltip color="primary" position="top" text={button.tooltip}>
        {props => {
            return <Button {...props} aria-label={button.tooltip} size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={(event) => {button.onClick(event, value?.());}}>{button.label}</Button>;
        }}
    </DiscordModules.Tooltip>;
}
// <Switch disabled={disabled} checked={isEnabled} onChange={onChange} />
function makeSwitch(control: any) {
    return <Flex align={Flex.Align.CENTER} style={{gap: "10px"}}>
        <Text>{control.label}</Text>
        <Switch onChange={control.onChange} value={control.checked} />
    </Flex>;
}

function buildControl(value: boolean | any, control: boolean | any) {
    if (control.type == "boolean") return makeSwitch(control);
    return makeButton(control, value);
}

interface Props {
    value: string;
    language?: string;
    id?: string;
    controls: any[]; // TODO: proper typing when refactoring
    onChange: (c: string) => void;
}

export default forwardRef(function CodeEditor({value, language: requestedLang = "css", id = "bd-editor", controls = [], onChange: notifyParent}: Props, ref) {
    const language = useMemo(() => {
        const requested = requestedLang.toLowerCase().replace(/ /g, "_");
        if (!languages.includes(requested)) return "css";
        return requested;
    }, [requestedLang]);

    const [theme, setTheme] = useState(() => Stores.ThemeStore?.theme === "light" ? "vs" : "vs-dark");
    const [editor, setEditor] = useState<typeof window.monaco>();
    const [, setBindings] = useState<Array<{dispose(): void;}>>([]);

    const onThemeChange = useCallback(() => {
        const newTheme = Stores.ThemeStore?.theme === "light" ? "vs" : "vs-dark";
        if (newTheme === theme) return;
        if (window.monaco?.editor) window.monaco.editor.setTheme(newTheme);
        setTheme(newTheme);
    }, [theme]);

    const onChange = useCallback(() => {
        notifyParent?.(editor?.getValue());
    }, [editor, notifyParent]);
    const resize = useCallback(() => editor?.layout(), [editor]);
    const showSettings = useCallback(() => editor?.keyBinding.$defaultHandler.commands.showSettingsMenu.exec(editor), [editor]);

    useImperativeHandle(ref, () => {
        return {
            resize,
            showSettings,
            get value() {return editor.getValue();},
            set value(newValue) {editor.setValue(newValue);}
        };
    }, [editor, resize, showSettings]);

    useEffect(() => {
        setBindings(bins => [...bins, editor?.onDidChangeModelContent(onChange)]);
        return () => {
            setBindings(bins => {
                for (const binding of bins) binding?.dispose();
                return [];
            });
        };
    }, [editor, onChange]);

    useEffect(() => {
        let toDispose = null;
        if (window.monaco?.editor) {
            const monacoEditor = window.monaco.editor.create(document.getElementById(id), {
                value: value,
                language: language,
                theme: theme,
                fontSize: Settings.get("settings", "editor", "fontSize"),
                lineNumbers: Settings.get("settings", "editor", "lineNumbers"),
                minimap: {enabled: Settings.get("settings", "editor", "minimap")},
                hover: {enabled: Settings.get("settings", "editor", "hover")},
                quickSuggestions: {
                    other: Settings.get("settings", "editor", "quickSuggestions"),
                    comments: Settings.get("settings", "editor", "quickSuggestions"),
                    strings: Settings.get("settings", "editor", "quickSuggestions")
                },
                renderWhitespace: Settings.get("settings", "editor", "renderWhitespace")
            });

            toDispose = monacoEditor;
            setEditor(monacoEditor);
        }
        else {

            const textarea = document.createElement("textarea");
            textarea.className = "bd-fallback-editor";
            textarea.value = value;

            setEditor({
                dispose: () => textarea.remove(),
                getValue: () => textarea.value,
                setValue: (val: string) => textarea.value = val,
                layout: () => {},
                onDidChangeModelContent: (cb: (e: Event) => void) => {
                    textarea.onchange = cb;
                    textarea.oninput = cb;
                }
            });

            document.getElementById(id)?.appendChild(textarea);
        }

        return () => {
            toDispose?.dispose?.();
        };
    }, [id, language, theme, value]);

    useEffect(() => {
        Stores.ThemeStore?.addChangeListener?.(onThemeChange);
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            Stores.ThemeStore?.removeChangeListener?.(onThemeChange);
        };
    }, [onThemeChange, resize]);


    if (editor && editor.layout) editor.layout();

    const controlsLeft = controls.filter(c => c.side != "right").map(buildControl.bind(null, () => editor?.getValue()));
    const controlsRight = controls.filter(c => c.side == "right").map(buildControl.bind(null, () => editor?.getValue()));

    return <div id="bd-editor-panel" className={theme}>
        <div id="bd-editor-controls">
            <div className="controls-section controls-left">
                {controlsLeft}
            </div>
            <div className="controls-section controls-right">
                {controlsRight}
            </div>
        </div>
        <div className="editor-wrapper">
            <div id={id} className={"editor " + theme}></div>
        </div>
    </div>;
});
