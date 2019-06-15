import {React, WebpackModules} from "modules";

import Checkbox from "./checkbox";

const Tooltip = WebpackModules.getByDisplayName("Tooltip");

const languages = ["abap", "abc", "actionscript", "ada", "apache_conf", "asciidoc", "assembly_x86", "autohotkey", "batchfile", "bro", "c_cpp", "c9search", "cirru", "clojure", "cobol", "coffee", "coldfusion", "csharp", "csound_document", "csound_orchestra", "csound_score", "css", "curly", "d", "dart", "diff", "dockerfile", "dot", "drools", "dummy", "dummysyntax", "eiffel", "ejs", "elixir", "elm", "erlang", "forth", "fortran", "ftl", "gcode", "gherkin", "gitignore", "glsl", "gobstones", "golang", "graphqlschema", "groovy", "haml", "handlebars", "haskell", "haskell_cabal", "haxe", "hjson", "html", "html_elixir", "html_ruby", "ini", "io", "jack", "jade", "java", "javascript", "json", "jsoniq", "jsp", "jssm", "jsx", "julia", "kotlin", "latex", "less", "liquid", "lisp", "livescript", "logiql", "lsl", "lua", "luapage", "lucene", "makefile", "markdown", "mask", "matlab", "maze", "mel", "mushcode", "mysql", "nix", "nsis", "objectivec", "ocaml", "pascal", "perl", "pgsql", "php", "pig", "powershell", "praat", "prolog", "properties", "protobuf", "python", "r", "razor", "rdoc", "red", "rhtml", "rst", "ruby", "rust", "sass", "scad", "scala", "scheme", "scss", "sh", "sjs", "smarty", "snippets", "soy_template", "space", "sql", "sqlserver", "stylus", "svg", "swift", "tcl", "tex", "text", "textile", "toml", "tsx", "twig", "typescript", "vala", "vbscript", "velocity", "verilog", "vhdl", "wollok", "xml", "xquery", "yaml", "django"];
const themes = ["chrome", "clouds", "crimson_editor", "dawn", "dreamweaver", "eclipse", "github", "iplastic", "solarized_light", "textmate", "tomorrow", "xcode", "kuroir", "katzenmilch", "sqlserver", "ambiance", "chaos", "clouds_midnight", "cobalt", "gruvbox", "gob", "idle_fingers", "kr_theme", "merbivore", "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "terminal", "tomorrow_night", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "twilight", "vibrant_ink"];

export default class CodeEditor extends React.Component {
    static get defaultId() {return "bd-editor";}

    constructor(props) {
        super(props);
        
        for (const control of this.props.controls) {
            if (control.type == "checkbox") continue;
            if (control.onClick == "showSettings") control.onClick = this.showSettings.bind(this);
        }

        this.props.theme = this.props.theme.toLowerCase().replace(/ /g, "_");
        if (!themes.includes(this.props.theme)) this.props.theme = CodeEditor.defaultProps.theme;

        this.props.language = this.props.language.toLowerCase().replace(/ /g, "_");
        if (!languages.includes(this.props.language)) this.props.language = CodeEditor.defaultProps.language;

        this.onChange = this.onChange.bind(this);
    }

    static get defaultProps() {
        return {
            controls: [],
            theme: "bd-monokai",
            language: "css",
            id: this.defaultId,
            fontSize: 14
        };
    }

    static get themes() {return themes;}

    componentDidMount() {
        this.editor = ace.edit(this.props.id);

        // Add id to the ace menu container
        const originalShow = this.editor.keyBinding.$defaultHandler.commands.showSettingsMenu.exec;
        this.editor.keyBinding.$defaultHandler.commands.showSettingsMenu.exec = function() {
            originalShow.apply(this, arguments);
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) continue;
                    const node = mutation.addedNodes[0];
                    if (node.parentElement !== document.body || !node.querySelector("#ace_settingsmenu")) continue;
                    node.id = "ace_settingsmenu_container";
                    observer.disconnect();
                }
            });
            observer.observe(document.body, {childList: true});
        };

        const theme = this.props.theme == CodeEditor.defaultProps.theme ? this.props.theme.split("-")[1] : this.props.theme;
        this.editor.setTheme(`ace/theme/${theme}`);
        this.editor.session.setMode(`ace/mode/${this.props.language}`);
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(this.props.fontSize);
        this.editor.on("change", this.onChange);
    }

    componentWillUnmount() {
        this.editor.destroy();
    }

    get value() {return this.editor.session.getValue();}
    set value(newValue) {
        this.editor.setValue(newValue);
    }

    onChange() {
        if (this.props.onChange) this.props.onChange(this.value);
    }

    showSettings() {return this.editor.keyBinding.$defaultHandler.commands.showSettingsMenu.exec(this.editor);}
    resize() {return this.editor.resize();}

    buildControl(control) {
        if (control.type == "checkbox") return this.makeCheckbox(control);
        return this.makeButton(control);
    }

    makeCheckbox(checkbox) {
        return <Checkbox text={checkbox.label} onChange={checkbox.onChange} checked={checkbox.checked} />;
    }

    makeButton(button) {
        return <Tooltip color="black" position="top" text={button.tooltip}>
                    {props => {
                        return <button {...props} className="btn btn-primary" onClick={(event) => {button.onClick(event, this.value);}}>{button.label}</button>;
                    }}
                </Tooltip>;
    }

    render() {
        if (this.editor && this.editor.resize) this.editor.resize();

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
                        <div id={this.props.id} className={"editor " + this.props.theme}>{this.props.value}</div>
                    </div>
                </div>;
    }
}