import {React} from "modules";

import Checkbox from "./checkbox";

const languages = ["abap", "abc", "actionscript", "ada", "apache_conf", "asciidoc", "assembly_x86", "autohotkey", "batchfile", "bro", "c_cpp", "c9search", "cirru", "clojure", "cobol", "coffee", "coldfusion", "csharp", "csound_document", "csound_orchestra", "csound_score", "css", "curly", "d", "dart", "diff", "dockerfile", "dot", "drools", "dummy", "dummysyntax", "eiffel", "ejs", "elixir", "elm", "erlang", "forth", "fortran", "ftl", "gcode", "gherkin", "gitignore", "glsl", "gobstones", "golang", "graphqlschema", "groovy", "haml", "handlebars", "haskell", "haskell_cabal", "haxe", "hjson", "html", "html_elixir", "html_ruby", "ini", "io", "jack", "jade", "java", "javascript", "json", "jsoniq", "jsp", "jssm", "jsx", "julia", "kotlin", "latex", "less", "liquid", "lisp", "livescript", "logiql", "lsl", "lua", "luapage", "lucene", "makefile", "markdown", "mask", "matlab", "maze", "mel", "mushcode", "mysql", "nix", "nsis", "objectivec", "ocaml", "pascal", "perl", "pgsql", "php", "pig", "powershell", "praat", "prolog", "properties", "protobuf", "python", "r", "razor", "rdoc", "red", "rhtml", "rst", "ruby", "rust", "sass", "scad", "scala", "scheme", "scss", "sh", "sjs", "smarty", "snippets", "soy_template", "space", "sql", "sqlserver", "stylus", "svg", "swift", "tcl", "tex", "text", "textile", "toml", "tsx", "twig", "typescript", "vala", "vbscript", "velocity", "verilog", "vhdl", "wollok", "xml", "xquery", "yaml", "django"];
const themes = ["chrome", "clouds", "crimson_editor", "dawn", "dreamweaver", "eclipse", "github", "iplastic", "solarized_light", "textmate", "tomorrow", "xcode", "kuroir", "katzenmilch", "sqlserver", "ambiance", "chaos", "clouds_midnight", "cobalt", "gruvbox", "gob", "idle_fingers", "kr_theme", "merbivore", "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "terminal", "tomorrow_night", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "twilight", "vibrant_ink"];

export default class CodeEditor extends React.Component {
    static get defaultId() {return "bd-editor";}

    constructor(props) {
        super(props);
        
        for (const button of this.props.buttons) {
            if (button.onClick == "showSettings") button.onClick = this.showSettings.bind(this);
        }

        this.props.theme = this.props.theme.toLowerCase().replace(/ /g, "_");
        if (!themes.includes(this.props.theme)) this.props.theme = this.defaultProps.theme;

        this.props.language = this.props.language.toLowerCase().replace(/ /g, "_");
        if (!languages.includes(this.props.language)) this.props.language = this.defaultProps.language;
    }

    static get defaultProps() {
        return {
            buttons: [],
            checkboxes: [],
            theme: "monokai",
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

        this.editor.setTheme(`ace/theme/${this.props.theme}`);
        this.editor.session.setMode(`ace/mode/${this.props.language}`);
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(this.props.fontSize);
        if (this.props.onChange) {
            this.editor.on("change", () => {
                this.props.onChange(this.value);
            });
        }
    }

    componentWillUnmount() {
        this.editor.destroy();
    }

    get value() {return this.editor.session.getValue();}

    showSettings() {return this.editor.keyBinding.$defaultHandler.commands.showSettingsMenu.exec(this.editor);}

    render() {

        const buttons = this.props.buttons.map(button => 
                            <button className="btn btn-primary" onClick={(event) => {button.onClick(event, this.value);}}>{button.label}</button>
                        );

        const checkboxes = this.props.checkboxes.map(checkbox => 
                            <Checkbox text={checkbox.label} onChange={checkbox.onChange} checked={checkbox.checked} />
                        );

        return <div id="bd-editor-panel">
                    <div className="editor-wrapper">
                        <div id={this.props.id} className="editor">{this.props.value}</div>
                    </div>
                    <div id="bd-editor-controls">
                        {checkboxes.length && <div className="checkbox-group">{checkboxes}</div>}
                        <div id="bd-editor-buttons">
                            {buttons}
                            {this.props.notice && <span className="small-notice">{this.props.notice}</span>}
                        </div>
                        {this.props.showHelp && <div className="help-text">
                                Press <code className="inline">ctrl</code>+<code className="inline">,</code> with the editor focused to access the editor&apos;s settings.
                            </div>}
                    </div>
                </div>;
    }
}