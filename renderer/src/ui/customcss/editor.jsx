import {React, WebpackModules, DiscordModules, Settings} from "modules";

import Checkbox from "./checkbox";

const Tooltip = WebpackModules.getByDisplayName("Tooltip");

const languages = ["abap", "abc", "actionscript", "ada", "apache_conf", "asciidoc", "assembly_x86", "autohotkey", "batchfile", "bro", "c_cpp", "c9search", "cirru", "clojure", "cobol", "coffee", "coldfusion", "csharp", "csound_document", "csound_orchestra", "csound_score", "css", "curly", "d", "dart", "diff", "dockerfile", "dot", "drools", "dummy", "dummysyntax", "eiffel", "ejs", "elixir", "elm", "erlang", "forth", "fortran", "ftl", "gcode", "gherkin", "gitignore", "glsl", "gobstones", "golang", "graphqlschema", "groovy", "haml", "handlebars", "haskell", "haskell_cabal", "haxe", "hjson", "html", "html_elixir", "html_ruby", "ini", "io", "jack", "jade", "java", "javascript", "json", "jsoniq", "jsp", "jssm", "jsx", "julia", "kotlin", "latex", "less", "liquid", "lisp", "livescript", "logiql", "lsl", "lua", "luapage", "lucene", "makefile", "markdown", "mask", "matlab", "maze", "mel", "mushcode", "mysql", "nix", "nsis", "objectivec", "ocaml", "pascal", "perl", "pgsql", "php", "pig", "powershell", "praat", "prolog", "properties", "protobuf", "python", "r", "razor", "rdoc", "red", "rhtml", "rst", "ruby", "rust", "sass", "scad", "scala", "scheme", "scss", "sh", "sjs", "smarty", "snippets", "soy_template", "space", "sql", "sqlserver", "stylus", "svg", "swift", "tcl", "tex", "text", "textile", "toml", "tsx", "twig", "typescript", "vala", "vbscript", "velocity", "verilog", "vhdl", "wollok", "xml", "xquery", "yaml", "django"];

export default class CodeEditor extends React.Component {
    static get defaultId() {return "bd-editor";}

    constructor(props) {
        super(props);

        this.props.theme = DiscordModules.UserSettingsStore && DiscordModules.UserSettingsStore.theme === "light" ? "vs" : "vs-dark";

        this.props.language = this.props.language.toLowerCase().replace(/ /g, "_");
        if (!languages.includes(this.props.language)) this.props.language = CodeEditor.defaultProps.language;

        this.bindings = [];
        this.resize = this.resize.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onThemeChange = this.onThemeChange.bind(this);
    }

    static get defaultProps() {
        return {
            controls: [],
            language: "css",
            id: this.defaultId
        };
    }

    componentDidMount() {
        if (window.monaco?.editor) {
            this.editor = window.monaco.editor.create(document.getElementById(this.props.id), {
                value: this.props.value,
                language: this.props.language,
                theme: DiscordModules.UserSettingsStore.theme == "light" ? "vs" : "vs-dark",
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

            this.bindings.push(this.editor.onDidChangeModelContent(this.onChange));
        }
        else {

            const textarea = document.createElement("textarea");
            textarea.className = "bd-fallback-editor";
            textarea.value = this.props.value;
            textarea.onchange = (e) => this.onChange(e.target.value);
            textarea.oninput = (e) => this.onChange(e.target.value);

            this.editor = {
                dispose: () => textarea.remove(),
                getValue: () => textarea.value,
                setValue: (value) => textarea.value = value,
                layout: () => {},
            };

            document.getElementById(this.props.id).appendChild(textarea);
        }

        if (DiscordModules.UserSettingsStore) DiscordModules.UserSettingsStore.addChangeListener(this.onThemeChange);
        window.addEventListener("resize", this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize);
        if (DiscordModules.UserSettingsStore) DiscordModules.UserSettingsStore.removeChangeListener(this.onThemeChange);
        for (const binding of this.bindings) binding.dispose();
        this.editor.dispose();
    }

    onThemeChange() {
        const newTheme = DiscordModules.UserSettingsStore.theme === "light" ? "vs" : "vs-dark";
        if (newTheme === this.props.theme) return;
        this.props.theme = newTheme;
        if (window.monaco?.editor) window.monaco.editor.setTheme(this.props.theme);
    }

    get value() {return this.editor.getValue();}
    set value(newValue) {this.editor.setValue(newValue);}

    onChange() {
        if (this.props.onChange) this.props.onChange(this.value);
    }

    showSettings() {return this.editor.keyBinding.$defaultHandler.commands.showSettingsMenu.exec(this.editor);}
    resize() {this.editor.layout();}

    buildControl(control) {
        if (control.type == "checkbox") return this.makeCheckbox(control);
        return this.makeButton(control);
    }

    makeCheckbox(checkbox) {
        return <Checkbox text={checkbox.label} onChange={checkbox.onChange} checked={checkbox.checked} />;
    }

    makeButton(button) {
        return <Tooltip color="primary" position="top" text={button.tooltip}>
                    {props => {
                        return <button {...props} className="btn btn-primary" onClick={(event) => {button.onClick(event, this.value);}}>{button.label}</button>;
                    }}
                </Tooltip>;
    }

    render() {
        if (this.editor && this.editor.layout) this.editor.layout();

        const controlsLeft = this.props.controls.filter(c => c.side != "right").map(this.buildControl.bind(this));
        const controlsRight = this.props.controls.filter(c => c.side == "right").map(this.buildControl.bind(this));

        return <div id="bd-editor-panel" className={this.props.theme}>
                    <div id="bd-editor-controls">
                        <div className="controls-section controls-left">
                            {controlsLeft}
                        </div>
                        <div className="controls-section controls-right">
                            {controlsRight}
                        </div>
                    </div>
                    <div className="editor-wrapper">
                        <div id={this.props.id} className={"editor " + this.props.theme}></div>
                    </div>
                </div>;
    }
}