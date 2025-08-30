import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import Settings from "@stores/settings";
import EditorStore from "@stores/editor";
import Editor from "@modules/editor";

import Button from "../base/button";
import Flex from "../base/flex";
import Switch from "../settings/components/switch";
import Text from "@ui/base/text";
import {useStateFromStores} from "@ui/hooks";
import {useLayoutEffect, useRef} from "react";

import type {editor as MonacoEditor} from "monaco-editor";
import {Braces, CircleX, Info, TriangleAlert} from "lucide-react";

type IStandaloneCodeEditor = MonacoEditor.IStandaloneCodeEditor;
type IStandaloneEditorConstructionOptions = MonacoEditor.IStandaloneEditorConstructionOptions;

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

export default forwardRef(function CodeEditor({value, language: requestedLang = "css", id = "bd-editor", controls = [], onChange: notifyParent}: Props, editorRef) {
    const ref = useRef<HTMLDivElement>(null);
    const windowRef = useRef<HTMLDivElement>(null);

    const language = useMemo(() => {
        const requested = requestedLang.toLowerCase().replace(/ /g, "_");
        if (!languages.includes(requested)) return "css";
        return requested;
    }, [requestedLang]);

    const [theme, setTheme] = useState(() => EditorStore.getEditorOptions().theme);
    const [editor, setEditor] = useState<IStandaloneCodeEditor | undefined>();
    const [, setBindings] = useState<Array<{dispose(): void;} | undefined>>([]);

    const [selection, setSelection] = useState<[line: number, col: number, selected: number]>([0, 0, 0]);
    const [markerInfo, setInfo] = useState<[errors: number, warnings: number, markers: any[]]>([0, 0, []]);
    const {insertSpaces, tabSize} = useStateFromStores(Settings, () => ({
        insertSpaces: Settings.get<boolean>("settings", "editor", "insertSpaces"),
        tabSize: Settings.get<number>("settings", "editor", "tabSize")
    }));

    const [showingProblems, setShowingProblems] = useState(false);
    const toggleShowingProblems = useCallback(() => setShowingProblems(v => !v), []);

    const onChange = useCallback(() => {
        if (editor) notifyParent?.(editor.getValue());
    }, [editor, notifyParent]);
    const resize = useCallback(() => editor?.layout(), [editor]);

    useImperativeHandle(editorRef, () => {
        return {
            resize,
            get value() {return editor!.getValue();},
            set value(newValue) {editor!.setValue(newValue);}
        };
    }, [editor, resize]);

    useEffect(() => {
        setBindings(bins => [...bins, editor?.onDidChangeModelContent(onChange)]);
        return () => {
            setBindings(bins => {
                for (const binding of bins) binding?.dispose();
                return [];
            });
        };
    }, [editor, onChange]);

    useLayoutEffect(() => {
        const node = ref.current || document.getElementById(id);
        if (!node) return;

        const createFallback = () => {
            const textarea = document.createElement("textarea");
            textarea.className = "bd-fallback-editor";
            textarea.value = value;

            setEditor({
                dispose: () => textarea.remove(),
                getValue: () => textarea.value,
                setValue: (val: string) => textarea.value = val,
                layout: () => {},
                onDidChangeModelContent: ((cb: (e: Event) => void) => {
                    textarea.onchange = cb;
                    textarea.oninput = cb;

                    return {
                        dispose() {}
                    };
                }) as any,
                // @ts-expect-error For the footer
                isFallback: true
            });

            node.appendChild(textarea);
        };

        if (Editor.failedToLoad) {
            createFallback();
            return;
        }

        let disposed = false;
        let disposer: (() => void) | undefined;

        const createMonaco = () => {
            const getOptions = () => ({
                value: value,
                language: language,
                ...EditorStore.getEditorOptions()
            } as IStandaloneEditorConstructionOptions);

            const onDidChangeMarkers = window.monaco.editor.onDidChangeMarkers(([uri]) => {
                if (monacoEditor.getModel()!.uri !== uri) {
                    return;
                }

                const markers = window.monaco.editor.getModelMarkers({resource: uri});

                let errors = 0;
                let warnings = 0;

                for (const element of markers) {
                    if (element.severity === 4) warnings++;
                    else if (element.severity === 8) errors++;
                }

                setInfo([errors, warnings, markers]);
            });

            const monacoEditor = window.monaco.editor.create(node, getOptions());

            setEditor(monacoEditor);

            monacoEditor.onDidChangeCursorSelection(() => {
                const position = monacoEditor.getPosition()!;

                const $selection = monacoEditor.getSelection();

                const selectedText = monacoEditor.getModel()!.getValueInRange($selection!);

                setSelection([position.lineNumber, position.column, selectedText.length]);
            });

            function updateThemingVars() {
                const styles = getComputedStyle(monacoEditor.getDomNode()!);

                const background = styles.getPropertyValue("--vscode-editor-background");
                const foreground = styles.getPropertyValue("--vscode-foreground");
                const tableColumnsBorder = styles.getPropertyValue("--vscode-tree-tableColumnsBorder");

                let container = windowRef.current!.parentElement!.parentElement;
                if (!container || !container.classList.contains("floating-window")) container = windowRef.current!;

                if (container) {
                    container.style.setProperty("--bd-editor-background", background);
                    container.style.setProperty("--bd-editor-foreground", foreground);
                    container.style.setProperty("--bd-editor-divider", tableColumnsBorder);
                }
            }

            const undo = EditorStore.addChangeListener(() => {
                monacoEditor.updateOptions(getOptions());
                setTheme(EditorStore.getEditorOptions().theme);
                updateThemingVars();
            });

            updateThemingVars();

            disposer = () => {
                monacoEditor.dispose();
                undo();
                onDidChangeMarkers.dispose();
            };

            if (disposed) disposer();
        };

        if (window.monaco?.editor) {
            createMonaco();
        }
        else {
            Editor.initialize().then(() => {
                if (window.monaco?.editor) createMonaco();
                else createFallback();
            });
        }

        return () => {
            disposed = true;
            disposer?.();
        };
    }, [id, language, value]);

    useEffect(() => {
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, [resize]);


    if (editor && editor.layout) editor.layout();

    const gotoLine = useCallback(() => {
        editor!.focus();
        editor!.trigger("keyboard", "editor.action.gotoLine", "");
    }, [editor]);

    const controlsLeft = controls.filter(c => c.side != "right").map(buildControl.bind(null, () => editor?.getValue()));
    const controlsRight = controls.filter(c => c.side == "right").map(buildControl.bind(null, () => editor?.getValue()));

    return <div id="bd-editor-panel" className={theme} ref={windowRef}>
        <div id="bd-editor-controls">
            <div className="controls-section controls-left">
                {controlsLeft}
            </div>
            <div className="controls-section controls-right">
                {controlsRight}
            </div>
        </div>
        <div className="editor-wrapper">
            <div id={id} ref={ref} className={"editor " + theme} />
            {showingProblems && (
                <div className="bd-editor-problems">
                    {markerInfo[2].length === 0 && (
                        <div className="bd-editor-no-problems">No Problems have been detected.</div>
                    )}
                    {markerInfo[2].map((marker, index) => (
                        <div key={index} className={`bd-editor-problem bd-editor-severity-${marker.severity}`}>
                            {marker.severity === 8 ? (
                                // <span className="codicon codicon-error" />
                                <CircleX size="1em" />
                            ) : marker.severity === 4 ? (
                                // <span className="codicon codicon-warning" />
                                <TriangleAlert size="1em" />
                            ) : marker.severity === 2 ? (
                                // <span className="codicon codicon-info" />
                                <Info size="1em" />
                            ) : (
                                <Info size="1em" />
                            )}
                            <span>{marker.message}</span>
                            <span>{marker.source}({marker.code})</span>
                            <span>[Ln {marker.startLineNumber}, Col {marker.startColumn}]</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
        {/* @ts-expect-error Dont display the footer if its the footer */}
        {!editor?.isFallback && (
            <div className="bd-editor-footer">
                <div className="bd-editor-footer-left">
                    <div className="bd-editor-footer-item" onClick={toggleShowingProblems}>
                        <CircleX size="1em" />
                        <span>{" "}{markerInfo[0]}{" "}</span>
                        <TriangleAlert size="1em" />
                        <span>{" "}{markerInfo[1]}</span>
                    </div>
                </div>
                <div className="bd-editor-footer-right">
                    <div className="bd-editor-footer-item" onClick={gotoLine}>
                        <span>Ln {selection[0]}</span>
                        <span>, </span>
                        <span>Col {selection[1]}</span>
                        {!!selection[2] && (
                            <span> ({selection[2]} selected)</span>
                        )}
                    </div>
                    <div className="bd-editor-footer-item">
                        <span>{insertSpaces ? "Spaces" : "Tabs"}</span>
                        <span>: </span>
                        <span>{tabSize}</span>
                    </div>
                    <div className="bd-editor-footer-item">
                        {/* <span className={`codicon ${markerInfo[0] ? "codicon-bracket-error" : "codicon-bracket"}`} /> */}
                        <Braces size="1em" />
                        <span>{" "}{language}</span>
                    </div>
                </div>
            </div>
        )}
    </div>;
});