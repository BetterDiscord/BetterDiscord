var settingsPanel, emoteModule, quickEmoteMenu, voiceMode, pluginModule, themeModule, dMode, publicServersModule;
var minSupportedVersion = "0.3.0";
var bbdVersion = "0.2.17";
var mainCore;
var settingsCookie = {};
var bdpluginErrors = [], bdthemeErrors = []; // define for backwards compatibility
var bdConfig = null;

































































































































































/*V2 Premature*/









class V2C_SettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let {settings} = this.props;
        return BDV2.react.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(V2Components.SettingsTitle, {text: this.props.title}),
            this.props.button && BDV2.react.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: this.props.button.onClick}, this.props.button.title),
            settings.map(setting => {
                return BDV2.react.createElement(V2Components.Switch, {id: setting.id, key: setting.id, data: setting, checked: settingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    }});
            })
        );
    }
}

class V2C_SettingsGroup extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        const {title, settings, button} = this.props;
        const buttonComponent = button ? BDV2.react.createElement("button", {key: "title-button", className: "bd-pfbtn", onClick: button.onClick}, button.title) : null;
        return [BDV2.react.createElement(V2Components.SettingsTitle, {text: title}),
                buttonComponent,
                settings.map(setting => {
                    return BDV2.react.createElement(V2Components.Switch, {id: setting.id, key: setting.id, data: setting, checked: settingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    }});
                })];
    }
}

class V2C_SectionedSettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            this.props.sections.map(section => {
                return BDV2.react.createElement(V2Components.SettingsGroup, Object.assign({}, section, this.props.onChange));
            })
        );
    }
}

class V2C_Switch extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: this.props.checked
        };
    }

    render() {
        let {text, info} = this.props.data;
        let {checked} = this.state;
        return BDV2.react.createElement(
            "div",
            {className: "ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item"},
            BDV2.react.createElement(
                "div",
                {className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap"},
                BDV2.react.createElement(
                    "h3",
                    {className: "ui-form-title h3 margin-reset margin-reset ui-flex-child"},
                    text
                ),
                BDV2.react.createElement(
                    "label",
                    {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                    BDV2.react.createElement("input", {className: "ui-switch-checkbox", type: "checkbox", checked: checked, onChange: e => this.onChange(e)}),
                    BDV2.react.createElement("div", {className: `ui-switch ${checked ? "checked" : ""}`})
                )
            ),
            BDV2.react.createElement(
                "div",
                {className: "ui-form-text style-description margin-top-4", style: {flex: "1 1 auto"}},
                info
            )
        );
    }

    onChange() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            checked: !this.state.checked
        });
    }
}

class V2C_Scroller extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        //scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y
        let wrapperClass = `scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d${this.props.fade ? " scrollerFade-1Ijw5y" : ""}`;
        let scrollerClass = "scroller-2FKFPG scroller";                                          /* fuck */
        if (this.props.sidebar) scrollerClass = "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix sidebarRegionScroller-3MXcoP sidebar-region-scroller scroller";
        if (this.props.contentColumn) {
            scrollerClass = "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix contentRegionScroller-26nc1e content-region-scroller scroller";                                         /* fuck */
            wrapperClass = "scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix contentRegionScrollerWrap-3YZXdm content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv";
        }
        let {children} = this.props;
        return BDV2.react.createElement(
            "div",
            {key: "scrollerwrap", className: wrapperClass},
            BDV2.react.createElement(
                "div",
                {key: "scroller", ref: "scroller", className: scrollerClass},
                children
            )
        );
    }
}

class V2C_TabBarItem extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onClick = this.onClick.bind(this);
    }

    setInitialState() {
        this.state = {
            selected: this.props.selected || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: `ui-tab-bar-item${this.props.selected ? " selected" : ""}`, onClick: this.onClick},
            this.props.text
        );
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.id);
        }
    }
}

class V2C_TabBarSeparator extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement("div", {className: "ui-tab-bar-separator margin-top-8 margin-bottom-8"});
    }
}

class V2C_TabBarHeader extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: "ui-tab-bar-header"},
            this.props.text
        );
    }
}

class V2C_SideBar extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        const si = $("[class*=side] > [class*=selected]");
        if (si.length) self.scn = si.attr("class");
        const ns = $("[class*=side] > [class*=notSelected]");
        if (ns.length) self.nscn = ns.attr("class");
        $("[class*='side-'] > [class*='item-']").on("click", () => {
            self.setState({
                selected: null
            });
        });
        self.setInitialState();
        self.onClick = self.onClick.bind(self);
    }

    setInitialState() {
        let self = this;
        self.state = {
            selected: null,
            items: self.props.items
        };

        let initialSelection = self.props.items.find(item => {
            return item.selected;
        });
        if (initialSelection) {
            self.state.selected = initialSelection.id;
        }
    }

    render() {
        let self = this;
        let {headerText} = self.props;
        let {items, selected} = self.state;
        return BDV2.react.createElement(
            "div",
            null,
            BDV2.react.createElement(V2Components.TabBar.Separator, null),
            BDV2.react.createElement(V2Components.TabBar.Header, {text: headerText}),
            items.map(item => {
                let {id, text} = item;
                return BDV2.react.createElement(V2Components.TabBar.Item, {key: id, selected: selected === id, text: text, id: id, onClick: self.onClick});
            })
        );
    }

    onClick(id) {
        let self = this;
        const si = $("[class*=side] > [class*=selected]");
        if (si.length) {
            si.off("click.bdsb").on("click.bsb", e => {
                $(e.target).attr("class", self.scn);
            });
            si.attr("class", self.nscn);
        }

        self.setState({selected: null});
        self.setState({selected: id});

        if (self.props.onClick) self.props.onClick(id);
    }
}

class V2C_ReloadIcon extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                fill: "#dcddde",
                className: "bd-reload " + this.props.className,
                onClick: this.props.onClick,
                style: {width: this.props.size || "24px", height: this.props.size || "24px"}
            },
            BDV2.react.createElement("path", {d: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"}),
            BDV2.react.createElement("path", {fill: "none", d: "M0 0h24v24H0z"})
        );
    }
}

class V2C_XSvg extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "svg",
            {xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 12 12", style: {width: "18px", height: "18px"}},
            BDV2.react.createElement(
                "g",
                {className: "background", fill: "none", fillRule: "evenodd"},
                BDV2.react.createElement("path", {d: "M0 0h12v12H0"}),
                BDV2.react.createElement("path", {className: "fill", fill: "#dcddde", d: "M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"})
            )
        );
    }
}

class V2C_Tools extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    render() {
        return BDV2.react.createElement("div", {className: "tools-container toolsContainer-1edPuj"},
            BDV2.react.createElement("div", {className: "tools tools-3-3s-N"},
                BDV2.react.createElement("div", {className: "container-1sFeqf"},
                    BDV2.react.createElement("div",
                        {className: "btn-close closeButton-1tv5uR", onClick: this.onClick},
                        BDV2.react.createElement(V2Components.XSvg, null)
                    ),
                    BDV2.react.createElement(
                        "div",
                        {className: "esc-text keybind-KpFkfr"},
                        "ESC"
                    )
                )
            )
        );
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
        $(".closeButton-1tv5uR").first().click();
    }
}

class V2C_SettingsTitle extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }
//h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi da-h2 da-title da-size16 da-height20 da-weightSemiBold defaultColor-1_ajX0 da-defaultColor marginTop60-3PGbtK da-marginTop60 marginBottom20-32qID7 da-marginBottom20
    render() {
        return BDV2.react.createElement(
            "h2",
            {className: "ui-form-title h2 margin-reset margin-bottom-20 marginTop60-3PGbtK da-marginTop6"},
            this.props.text
        );
    }
}

class V2C_Checkbox extends BDV2.reactComponent {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.setInitialState();
    }

    setInitialState() {
        this.state = {
            checked: this.props.checked || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "li",
            null,
            BDV2.react.createElement(
                "div",
                {className: "checkbox checkbox-3kaeSU da-checkbox checkbox-3EVISJ da-checkbox", onClick: this.onClick},
                BDV2.react.createElement(
                    "div",
                    {className: "checkbox-inner checkboxInner-3yjcPe da-checkboxInner"},
                    BDV2.react.createElement("input", {className: "checkboxElement-1qV33p da-checkboxElement", checked: this.state.checked, onChange: () => {}, type: "checkbox"}),
                    BDV2.react.createElement("span", null)
                ),
                BDV2.react.createElement(
                    "span",
                    null,
                    this.props.text
                )
            )
        );
    }

    onClick() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            checked: !this.state.checked
        });
    }
}

class V2C_CssEditorDetached extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.onChange = self.onChange.bind(self);
    }

    componentDidMount() {
        $("#app-mount").addClass("bd-detached-editor");
        BDV2.editorDetached = true;
        // this.updateLineCount();
        this.editor = ace.edit("bd-customcss-editor-detached");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/css");
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(14);
        this.editor.on("change", () => {
            if (!settingsCookie["bda-css-0"]) return;
            this.saveCss();
            this.updateCss();
        });

    }

    componentWillUnmount() {
        $("#app-mount").removeClass("bd-detached-editor");
        BDV2.editorDetached = false;
        this.editor.destroy();
    }

    updateLineCount() {
        let lineCount = this.refs.editor.value.split("\n").length;
        if (lineCount == this.props.lines) return;
        this.refs.lines.textContent = Array.from(new Array(lineCount), (_, i) => i + 1).join(".\n") + ".";
        this.props.lines = lineCount;
    }

    get options() {
        return {
            lineNumbers: true,
            mode: "css",
            indentUnit: 4,
            theme: "material",
            scrollbarStyle: "simple"
        };
    }

    get css() {
        let _ccss = DataStore.getBDData("bdcustomcss");
        let ccss = "";
        if (_ccss && _ccss !== "") {
            ccss = atob(_ccss);
        }
        return ccss;
    }

    get root() {
        let _root = $("#bd-customcss-detach-container");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.detachedRoot;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".app, .app-2rEoOp").length) return false;
        $("<div/>", {
            id: "bd-customcss-detach-container"
        }).insertAfter($(".app, .app-2rEoOp"));
        return true;
    }

    render() {
        let self = this;
        return BDV2.react.createElement(
            "div",
            {className: "bd-detached-css-editor", id: "bd-customcss-detach-editor"},
            BDV2.react.createElement(
                "div",
                {id: "bd-customcss-innerpane"},
                BDV2.react.createElement("div", {className: "editor-wrapper"},
                    BDV2.react.createElement("div", {id: "bd-customcss-editor-detached", className: "editor", ref: "editor"}, self.css)
                ),
                BDV2.react.createElement(
                    "div",
                    {id: "bd-customcss-attach-controls"},
                    BDV2.react.createElement(
                        "ul",
                        {className: "checkbox-group"},
                        BDV2.react.createElement(V2Components.Checkbox, {id: "live-update", text: "Live Update", onChange: self.onChange, checked: settingsCookie["bda-css-0"]})
                    ),
                    BDV2.react.createElement(
                        "div",
                        {id: "bd-customcss-detach-controls-button"},
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                }},
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                }},
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("attach");
                                }},
                            "Attach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            {style: {fontSize: "10px", marginLeft: "5px"}},
                            "Unsaved changes are lost on attach"
                        )
                    )
                )
            )
        );
    }

    onChange(id, checked) {
        switch (id) {
            case "live-update":
                settingsCookie["bda-css-0"] = checked;
                mainCore.saveSettings();
                break;
        }
    }

    onClick(id) {
        let self = this;
        switch (id) {
            case "attach":
                if ($("#editor-detached").length) self.props.attach();
                BDV2.reactDom.unmountComponentAtNode(self.root);
                self.root.remove();
                break;
            case "update":
                self.updateCss();
                break;
            case "save":
                self.saveCss();
                break;
        }
    }

    updateCss() {
        if ($("#customcss").length == 0) {
            $("head").append("<style id=\"customcss\"></style>");
        }
        $("#customcss").text(this.editor.session.getValue()).detach().appendTo(document.head);
    }

    saveCss() {
        DataStore.setBDData("bdcustomcss", btoa(this.editor.session.getValue()));
    }
}

class V2C_CssEditor extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.props.lines = 0;
        self.setInitialState();
        self.attach = self.attach.bind(self);
        self.detachedEditor = BDV2.react.createElement(V2C_CssEditorDetached, {attach: self.attach});
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.detach = self.detach.bind(self);
    }

    setInitialState() {
        this.state = {
            detached: this.props.detached || BDV2.editorDetached
        };
    }

    componentDidMount() {
        // this.updateLineCount();
        this.editor = ace.edit("bd-customcss-editor");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/css");
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(14);
        this.editor.on("change", () => {
            if (!settingsCookie["bda-css-0"]) return;
            this.saveCss();
            this.updateCss();
        });
    }

    componentWillUnmount() {
        this.editor.destroy();
    }

    componentDidUpdate(prevProps, prevState) {
        let self = this;
        if (prevState.detached && !self.state.detached) {
            BDV2.reactDom.unmountComponentAtNode(self.detachedRoot);
        }
    }

    codeMirror() {
    }

    get options() {
        return {
            lineNumbers: true,
            mode: "css",
            indentUnit: 4,
            theme: "material",
            scrollbarStyle: "simple"
        };
    }

    get css() {
        let _ccss = DataStore.getBDData("bdcustomcss");
        let ccss = "";
        if (_ccss && _ccss !== "") {
            ccss = atob(_ccss);
        }
        return ccss;
    }

    updateLineCount() {
        let lineCount = this.refs.editor.value.split("\n").length;
        if (lineCount == this.props.lines) return;
        this.refs.lines.textContent = Array.from(new Array(lineCount), (_, i) => i + 1).join(".\n") + ".";
        this.props.lines = lineCount;
    }

    render() {
        let self = this;

        let {detached} = self.state;
        return BDV2.react.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default", style: {padding: "60px 40px 0px"}},
            detached && BDV2.react.createElement(
                "div",
                {id: "editor-detached"},
                BDV2.react.createElement(V2Components.SettingsTitle, {text: "Custom CSS Editor"}),
                BDV2.react.createElement(
                    "h3",
                    null,
                    "Editor Detached"
                ),
                BDV2.react.createElement(
                    "button",
                    {className: "btn btn-primary", onClick: () => {
                            self.attach();
                        }},
                    "Attach"
                )
            ),
            !detached && BDV2.react.createElement(
                "div",
                null,
                BDV2.react.createElement(V2Components.SettingsTitle, {text: "Custom CSS Editor"}),
                BDV2.react.createElement("div", {className: "editor-wrapper"},
                    BDV2.react.createElement("div", {id: "bd-customcss-editor", className: "editor", ref: "editor"}, self.css)
                ),
                BDV2.react.createElement(
                    "div",
                    {id: "bd-customcss-attach-controls"},
                    BDV2.react.createElement(
                        "ul",
                        {className: "checkbox-group"},
                        BDV2.react.createElement(V2Components.Checkbox, {id: "live-update", text: "Live Update", onChange: this.onChange, checked: settingsCookie["bda-css-0"]})
                    ),
                    BDV2.react.createElement(
                        "div",
                        {id: "bd-customcss-detach-controls-button"},
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                }},
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                }},
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("detach");
                                }},
                            "Detach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            {style: {fontSize: "10px", marginLeft: "5px"}},
                            "Unsaved changes are lost on detach"
                        ),
                        BDV2.react.createElement("div", {className: "help-text"},
                            "Press ",
                            BDV2.react.createElement("code", {className: "inline"}, "ctrl"),
                            "+",
                            BDV2.react.createElement("span", {className: "inline"}, ","),
                            " with the editor focused to access the editor's settings."
                        )
                    )
                )
            )
        );
    }

    onClick(arg) {
        let self = this;
        switch (arg) {
            case "update":
                self.updateCss();
                break;
            case "save":
                self.saveCss();
                break;
            case "detach":
                self.detach();
                break;
        }
    }

    onChange(id, checked) {
        switch (id) {
            case "live-update":
                settingsCookie["bda-css-0"] = checked;
                mainCore.saveSettings();
                break;
        }
    }

    updateCss() {
        if ($("#customcss").length == 0) {
            $("head").append("<style id=\"customcss\"></style>");
        }
        $("#customcss").text(this.editor.session.getValue()).detach().appendTo(document.head);
    }

    saveCss() {
        DataStore.setBDData("bdcustomcss", btoa(this.editor.session.getValue()));
    }

    detach() {
        let self = this;
        self.setState({
            detached: true
        });
        let droot = self.detachedRoot;
        if (!droot) {
            console.log("FAILED TO INJECT ROOT: .app");
            return;
        }
        BDV2.reactDom.render(self.detachedEditor, droot);
    }

    get detachedRoot() {
        let _root = $("#bd-customcss-detach-container");
        if (!_root.length) {
            if (!this.injectDetachedRoot()) return null;
            return this.detachedRoot;
        }
        return _root[0];
    }

    injectDetachedRoot() {
        if (!$(".app, .app-2rEoOp").length) return false;
        $("<div/>", {
            id: "bd-customcss-detach-container"
        }).insertAfter($(".app, .app-2rEoOp"));
        return true;
    }

    attach() {
        let self = this;
        self.setState({
            detached: false
        });
    }
}

class V2C_List extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "ul",
            {className: this.props.className},
            this.props.children
        );
    }
}

class V2C_ContentColumn extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(
                "h2",
                {className: "ui-form-title h2 margin-reset margin-bottom-20"},
                this.props.title
            ),
            this.props.children
        );
    }
}

class V2C_PluginCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.onChange = self.onChange.bind(self);
        self.showSettings = self.showSettings.bind(self);
        self.setInitialState();
        self.hasSettings = typeof self.props.plugin.getSettingsPanel === "function";
        self.settingsPanel = "";

        this.reload = this.reload.bind(this);
        this.onReload = this.onReload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: pluginCookie[this.props.plugin.getName()],
            settings: false,
            reloads: 0
        };
    }

    // componentDidMount() {
    //     BDEvents.on("plugin-reloaded", this.onReload);
    // }

    // componentWillUnmount() {
    //     BDEvents.off("plugin-reloaded", this.onReload);
    // }

    onReload(pluginName) {
        if (pluginName !== this.props.plugin.getName()) return;
        this.setState({reloads: this.state.reloads + 1});
    }

    componentDidUpdate() {
        if (this.state.settings) {
            if (typeof this.settingsPanel === "object") {
                this.refs.settingspanel.appendChild(this.settingsPanel);
            }

            if (!settingsCookie["fork-ps-3"]) return;
            var isHidden = (container, element) => {

                let cTop = container.scrollTop;
                let cBottom = cTop + container.clientHeight;

                let eTop = element.offsetTop;
                let eBottom = eTop + element.clientHeight;

                return  (eTop < cTop || eBottom > cBottom);
            };

            let self = $(BDV2.reactDom.findDOMNode(this));
            let container = self.parents(".scroller");
            if (!isHidden(container[0], self[0])) return;
            container.animate({
                scrollTop: self.offset().top - container.offset().top + container.scrollTop() - 30
            }, 300);
        }
    }

    reload() {
        const plugin = this.props.plugin.getName();
        pluginModule.reloadPlugin(plugin);
        this.props.plugin = bdplugins[plugin].plugin;
        this.onReload(this.props.plugin.getName());
    }

    getString(value) {
        return typeof value == "string" ? value : value.toString();
    }

    render() {
        let self = this;
        let {plugin} = this.props;
        let name = this.getString(plugin.getName());
        let author = this.getString(plugin.getAuthor());
        let description = this.getString(plugin.getDescription());
        let version = this.getString(plugin.getVersion());
        let website = bdplugins[name].website;
        let source = bdplugins[name].source;

        if (this.state.settings) {
            try { self.settingsPanel = plugin.getSettingsPanel(); }
            catch (err) { Utils.err("Plugins", "Unable to get settings panel for " + plugin.getName() + ".", err); }

            return BDV2.react.createElement("li", {className: "settings-open ui-switch-item"},
                    BDV2.react.createElement("div", {style: {"float": "right", "cursor": "pointer"}, onClick: () => {
                            this.refs.settingspanel.innerHTML = "";
                            self.setState({settings: false});
                        }},
                    BDV2.react.createElement(V2Components.XSvg, null)
                ),
                typeof self.settingsPanel === "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel"}),
                typeof self.settingsPanel !== "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel", dangerouslySetInnerHTML: {__html: self.settingsPanel}})
            );
        }

        return BDV2.react.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bda-header"},
                    BDV2.react.createElement("span", {className: "bda-header-title"},
                        BDV2.react.createElement("span", {className: "bda-name"}, name),
                        " v",
                        BDV2.react.createElement("span", {className: "bda-version"}, version),
                        " by ",
                        BDV2.react.createElement("span", {className: "bda-author"}, author)
                    ),
                    BDV2.react.createElement("div", {className: "bda-controls"},
                        !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload"}), {className: "bd-reload-card", onClick: this.reload}),
                        BDV2.react.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                            BDV2.react.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox"}),
                            BDV2.react.createElement("div", {className: this.state.checked ? "ui-switch checked" : "ui-switch"})
                        )
                    )
            ),
            BDV2.react.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bda-description scroller"}, description)
            ),
            (website || source || this.hasSettings) && BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    website && BDV2.react.createElement("a", {className: "bda-link bda-link-website", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && BDV2.react.createElement("a", {className: "bda-link bda-link-source", href: source, target: "_blank"}, "Source")
                ),
                this.hasSettings && BDV2.react.createElement("button", {onClick: this.showSettings, className: "bda-settings-button", disabled: !this.state.checked}, "Settings")
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        pluginModule.togglePlugin(this.props.plugin.getName());
    }

    showSettings() {
        if (!this.hasSettings) return;
        this.setState({settings: true});
    }
}

class V2C_ThemeCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
        this.reload = this.reload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: themeCookie[this.props.theme.name],
            reloads: 0
        };
    }

    // componentDidMount() {
    //     BDEvents.on("theme-reloaded", this.onReload);
    // }

    // componentWillUnmount() {
    //     BDEvents.off("theme-reloaded", this.onReload);
    // }

    onReload(themeName) {
        if (themeName !== this.props.theme.name) return;
        this.setState({reloads: this.state.reloads + 1});
    }

    reload() {
        const theme = this.props.theme.name;
        const error = themeModule.reloadTheme(theme);
        if (error) mainCore.showToast(`Could not reload ${bdthemes[theme].name}. Check console for details.`, {type: "error"});
        else mainCore.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been reloaded.`, {type: "success"});
        // this.setState(this.state);
        this.props.theme = bdthemes[theme];
        this.onReload(this.props.theme.name);
    }

    render() {
        let {theme} = this.props;
        let name = theme.name;
        let description = theme.description;
        let version = theme.version;
        let author = theme.author;
        let website = bdthemes[name].website;
        let source = bdthemes[name].source;

        return BDV2.react.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bda-header"},
                    BDV2.react.createElement("span", {className: "bda-header-title"},
                        BDV2.react.createElement("span", {className: "bda-name"}, name),
                        " v",
                        BDV2.react.createElement("span", {className: "bda-version"}, version),
                        " by ",
                        BDV2.react.createElement("span", {className: "bda-author"}, author)
                    ),
                    BDV2.react.createElement("div", {className: "bda-controls"},
                        !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload"}), {className: "bd-reload-card", onClick: this.reload}),
                        BDV2.react.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                            BDV2.react.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox"}),
                            BDV2.react.createElement("div", {className: this.state.checked ? "ui-switch checked" : "ui-switch"})
                        )
                    )
            ),
            BDV2.react.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bda-description scroller"}, description)
            ),
            (website || source) && BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    website && BDV2.react.createElement("a", {className: "bda-link", href: website, target: "_blank"}, "Website"),
                    website && source && " | ",
                    source && BDV2.react.createElement("a", {className: "bda-link", href: source, target: "_blank"}, "Source")
                )
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        themeModule.toggleTheme(this.props.theme.name);
    }
}

class V2Cs_TabBar {
    static get Item() {
        return V2C_TabBarItem;
    }
    static get Header() {
        return V2C_TabBarHeader;
    }
    static get Separator() {
        return V2C_TabBarSeparator;
    }
}


class V2Components {
    static get SettingsGroup() {
        return V2C_SettingsGroup;
    }
    static get SectionedSettingsPanel() {
        return V2C_SectionedSettingsPanel;
    }
    static get SettingsPanel() {
        return V2C_SettingsPanel;
    }
    static get Switch() {
        return V2C_Switch;
    }
    static get Scroller() {
        return V2C_Scroller;
    }
    static get TabBar() {
        return V2Cs_TabBar;
    }
    static get SideBar() {
        return V2C_SideBar;
    }
    static get Tools() {
        return V2C_Tools;
    }
    static get SettingsTitle() {
        return V2C_SettingsTitle;
    }
    static get CssEditor() {
        return V2C_CssEditor;
    }
    static get Checkbox() {
        return V2C_Checkbox;
    }
    static get List() {
        return V2C_List;
    }
    static get PluginCard() {
        return V2C_PluginCard;
    }
    static get ThemeCard() {
        return V2C_ThemeCard;
    }
    static get ContentColumn() {
        return V2C_ContentColumn;
    }
    static get ReloadIcon() {
        return V2C_ReloadIcon;
    }
    static get XSvg() {
        return V2C_XSvg;
    }
    static get Layer() {
        return V2C_Layer;
    }
    static get SidebarView() {
        return V2C_SidebarView;
    }
    static get ServerCard() {
        return V2C_ServerCard;
    }

    static TooltipWrap(Component, options) {

        const {style = "black", side = "top", text = ""} = options;
        const id = BDV2.KeyGenerator();

        return class extends BDV2.reactComponent {
            constructor(props) {
                super(props);
                this.onMouseEnter = this.onMouseEnter.bind(this);
                this.onMouseLeave = this.onMouseLeave.bind(this);
            }

            componentDidMount() {
                this.node = BDV2.reactDom.findDOMNode(this);
                this.node.addEventListener("mouseenter", this.onMouseEnter);
                this.node.addEventListener("mouseleave", this.onMouseLeave);
            }

            componentWillUnmount() {
                this.node.removeEventListener("mouseenter", this.onMouseEnter);
                this.node.removeEventListener("mouseleave", this.onMouseLeave);
            }

            onMouseEnter() {
		if (!BDV2.Tooltips) return;
                const {left, top, width, height} = this.node.getBoundingClientRect();
                BDV2.Tooltips.show(id, {
                    position: side,
                    text: text,
                    color: style,
                    targetWidth: width,
                    targetHeight: height,
                    windowWidth: Utils.screenWidth,
                    windowHeight: Utils.screenHeight,
                    x: left,
                    y: top
                });

                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        const nodes = Array.from(mutation.removedNodes);
                        const directMatch = nodes.indexOf(this.node) > -1;
                        const parentMatch = nodes.some(parent => parent.contains(this.node));
                        if (directMatch || parentMatch) {
                            this.onMouseLeave();
                            observer.disconnect();
                        }
                    });
                });

                observer.observe(document.body, {subtree: true, childList: true});
            }

            onMouseLeave() {
		if (!BDV2.Tooltips) return;
                BDV2.Tooltips.hide(id);
            }

            render() {
                return BDV2.react.createElement(Component, this.props);
            }
        };
    }
}

class V2_SettingsPanel_Sidebar {

    constructor(onClick) {
        this.onClick = onClick;
    }

    get items() {
        return [{text: "Settings", id: "core"}, {text: "Emotes", id: "emotes"}, {text: "Plugins", id: "plugins"}, {text: "Themes", id: "themes"}, {text: "Custom CSS", id: "customcss"}];
    }

    get component() {
        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(V2Components.SideBar, {onClick: this.onClick, headerText: "Bandaged BD", items: this.items}),
            BDV2.react.createElement(
                "div",
                {style: {fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "2px 10px"}},
                `BD v${bdConfig.version} by `,
                BDV2.react.createElement(
                    "a",
                    {href: "https://github.com/Jiiks/", target: "_blank"},
                    "Jiiks"
                )
            ),
            BDV2.react.createElement(
                "div",
                {style: {fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "2px 10px"}},
                `BBD v${bbdVersion} by `,
                BDV2.react.createElement(
                    "a",
                    {href: "https://github.com/rauenzi/", target: "_blank"},
                    "Zerebos"
                )
            )
        );
    }

    get root() {
        let _root = $("#bd-settings-sidebar");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        let changeLog = $("[class*='side-'] > [class*='item-']:not([class*=Danger])").last();
        if (!changeLog.length) return false;
        $("<span/>", {id: "bd-settings-sidebar"}).insertBefore(changeLog.prev());
        return true;
    }

    render() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: [class*='side-'] > [class*='item-']:not([class*=Danger])");
            return;
        }
        BDV2.reactDom.render(this.component, root);
        Utils.onRemoved(root, () => {
            BDV2.reactDom.unmountComponentAtNode(root);
        });
    }
}

class V2_SettingsPanel {

    constructor() {
        let self = this;
        self.sideBarOnClick = self.sideBarOnClick.bind(self);
        self.onChange = self.onChange.bind(self);
        self.updateSettings = this.updateSettings.bind(self);
        self.sidebar = new V2_SettingsPanel_Sidebar(self.sideBarOnClick);
    }

    get root() {
        let _root = $("#bd-settingspane-container");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".layer-3QrUeG .standardSidebarView-3F1I7i, .layer-3QrUeG .ui-standard-sidebar-view").length) return false;
        const root = $("<div/>", {
            "class": "contentRegion-3nDuYy content-region",
            "id": "bd-settingspane-container"
        });
        $(".layer-3QrUeG .standardSidebarView-3F1I7i, .layer-3QrUeG .ui-standard-sidebar-view").append(root);

        Utils.onRemoved(root[0], () => {
            BDV2.reactDom.unmountComponentAtNode(root[0]);
        });
        return true;
    }

    get coreSettings() {
        const settings = this.getSettings("core");
        const categories = [...new Set(settings.map(s => s.category))];
        const sections = categories.map(c => {return {title: c, settings: settings.filter(s => s.category == c)};});
        return sections;
    }

    get emoteSettings() {
        return this.getSettings("emote");
    }
    getSettings(category) {
        return Object.keys(settings).reduce((arr, key) => {
            let setting = settings[key];
            if (setting.cat === category && setting.implemented && !setting.hidden) {
                setting.text = key;
                arr.push(setting);
            }
            return arr;
        }, []);
    }

    sideBarOnClick(id) {
        let self = this;
        $(".contentRegion-3nDuYy, .content-region").first().hide();
        $(self.root).show();
        switch (id) {
            case "core":
                self.renderCoreSettings();
                break;
            case "emotes":
                self.renderEmoteSettings();
                break;
            case "customcss":
                self.renderCustomCssEditor();
                break;
            case "plugins":
                self.renderPluginPane();
                break;
            case "themes":
                self.renderThemePane();
                break;
        }
    }

    onClick() {}

    onChange(id, checked) {
        this.updateSettings(id, checked);
    }

    updateSettings(id, enabled) {
        settingsCookie[id] = enabled;

        if (id == "bda-es-0") {
            if (enabled) $("#twitchcord-button-container").show();
            else $("#twitchcord-button-container").hide();
        }

        // if (id == "bda-gs-b") {
        //     if (enabled) $("body").addClass("bd-blue");
        //     else $("body").removeClass("bd-blue");
        // }

        if (id == "bda-gs-2") {
            if (enabled) $("body").addClass("bd-minimal");
            else $("body").removeClass("bd-minimal");
        }

        if (id == "bda-gs-3") {
            if (enabled) $("body").addClass("bd-minimal-chan");
            else $("body").removeClass("bd-minimal-chan");
        }

        if (id == "bda-gs-1") {
            if (enabled) $("#bd-pub-li").show();
            else $("#bd-pub-li").hide();
        }

        if (id == "bda-gs-4") {
            if (enabled) voiceMode.enable();
            else voiceMode.disable();
        }

        if (id == "bda-gs-5") {
            if (enabled) $("#app-mount").addClass("bda-dark");
            else $("#app-mount").removeClass("bda-dark");
        }

        if (enabled && id == "bda-gs-6") mainCore.inject24Hour();

        if (id == "bda-gs-7") {
            if (enabled) mainCore.injectColoredText();
            else mainCore.removeColoredText();
        }

        if (id == "bda-es-4") {
            if (enabled) emoteModule.autoCapitalize();
            else emoteModule.disableAutoCapitalize();
        }

        if (id == "fork-ps-4") {
            if (enabled) ClassNormalizer.start();
            else ClassNormalizer.stop();
        }

        if (id == "fork-ps-5") {
            if (enabled) {
                ContentManager.watchContent("plugin");
                ContentManager.watchContent("theme");
            }
            else {
                ContentManager.unwatchContent("plugin");
                ContentManager.unwatchContent("theme");
            }
        }

        if (id == "fork-wp-1") {
            BdApi.setWindowPreference("transparent", enabled);
            if (enabled) BdApi.setWindowPreference("backgroundColor", null);
            else BdApi.setWindowPreference("backgroundColor", "#2f3136");
        }

        /*if (_c["fork-wp-2"]) {
            const current = BdApi.getWindowPreference("frame");
            if (current != _c["fork-wp-2"]) BdApi.setWindowPreference("frame", _c["fork-wp-2"]);
        }*/


        if (id == "bda-gs-8") {
            if (enabled) dMode.enable(settingsCookie["fork-dm-1"]);
            else dMode.disable();
        }

        mainCore.saveSettings();
    }

    initializeSettings() {
        if (settingsCookie["bda-es-0"]) $("#twitchcord-button-container").show();
        // if (settingsCookie["bda-gs-b"]) $("body").addClass("bd-blue");
        if (settingsCookie["bda-gs-2"]) $("body").addClass("bd-minimal");
        if (settingsCookie["bda-gs-3"]) $("body").addClass("bd-minimal-chan");
        if (settingsCookie["bda-gs-1"]) $("#bd-pub-li").show();
        if (settingsCookie["bda-gs-4"]) voiceMode.enable();
        if (settingsCookie["bda-gs-5"]) $("#app-mount").addClass("bda-dark");
        if (settingsCookie["bda-gs-6"]) mainCore.inject24Hour();
        if (settingsCookie["bda-gs-7"]) mainCore.injectColoredText();
        if (settingsCookie["bda-es-4"]) emoteModule.autoCapitalize();
        if (settingsCookie["fork-ps-4"]) ClassNormalizer.start();

        if (settingsCookie["fork-ps-5"]) {
            ContentManager.watchContent("plugin");
            ContentManager.watchContent("theme");
        }

        if (settingsCookie["bda-gs-8"]) dMode.enable(settingsCookie["fork-dm-1"]);

        mainCore.saveSettings();
    }

    renderSidebar() {
        let self = this;
        $("[class*='side-'] > [class*='item-']").off("click.v2settingspanel").on("click.v2settingspanel", () => {
            BDV2.reactDom.unmountComponentAtNode(self.root);
            $(self.root).hide();
            $(".contentRegion-3nDuYy, .content-region").first().show();
        });
        self.sidebar.render();
    }

    get coreComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [
            BDV2.react.createElement(V2Components.SectionedSettingsPanel, {key: "cspanel", onChange: this.onChange, sections: this.coreSettings}),
            BDV2.react.createElement(V2Components.Tools, {key: "tools"})
        ]});
    }

    get emoteComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {
            contentColumn: true, fade: true, dark: true, children: [
                BDV2.react.createElement(V2Components.SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings, button: {
                    title: "Clear Emote Cache",
                    onClick: () => { emoteModule.clearEmoteData(); emoteModule.init(); quickEmoteMenu.init(); }
                }}),
                BDV2.react.createElement(V2Components.Tools, {key: "tools"})
        ]});
    }

    get customCssComponent() {
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [BDV2.react.createElement(V2Components.CssEditor, {key: "csseditor"}), BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    contentComponent(type) {
        const componentElement = type == "plugins" ? this.pluginsComponent : this.themesComponent;
        const prefix = type.replace("s", "");
        const settingsList = this;
        class ContentList extends BDV2.react.Component {
            constructor(props) {
                super(props);
                this.onChange = this.onChange.bind(this);
            }

            componentDidMount() {
                BDEvents.on(`${prefix}-reloaded`, this.onChange);
                BDEvents.on(`${prefix}-loaded`, this.onChange);
                BDEvents.on(`${prefix}-unloaded`, this.onChange);
            }

            componentWillUnmount() {
                BDEvents.off(`${prefix}-reloaded`, this.onChange);
                BDEvents.off(`${prefix}-loaded`, this.onChange);
                BDEvents.off(`${prefix}-unloaded`, this.onChange);
            }

            onChange() {
                settingsList.sideBarOnClick(type);
            }

            render() {return componentElement;}
        }
        return BDV2.react.createElement(ContentList);
    }

    get pluginsComponent() {
        let plugins = Object.keys(bdplugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.PluginCard, {key: key, plugin: bdplugins[key].plugin}));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, {key: "plugin-list", className: "bda-slist", children: plugins});
        let refreshIcon = !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload Plugin List"}), {className: "bd-reload-header", size: "18px", onClick: async () => {
            pluginModule.updatePluginList();
            this.sideBarOnClick("plugins");
        }});
        let pfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    get themesComponent() {
        let themes = Object.keys(bdthemes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.ThemeCard, {key: key, theme: bdthemes[key]}));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, {key: "theme-list", className: "bda-slist", children: themes});
        let refreshIcon = !settingsCookie["fork-ps-5"] && BDV2.react.createElement(V2Components.TooltipWrap(V2Components.ReloadIcon, {color: "black", side: "top", text: "Reload Theme List"}), {className: "bd-reload-header", size: "18px", onClick: async () => {
            themeModule.updateThemeList();
            this.sideBarOnClick("themes");
        }});
        let tfBtn = BDV2.react.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.themesFolder); }}, "Open Theme Folder");
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, {key: "tcolumn", title: "Themes", children: [refreshIcon, tfBtn, list]});
        return BDV2.react.createElement(V2Components.Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, {key: "tools"})]});
    }

    renderCoreSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.coreComponent, root);
    }

    renderEmoteSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.emoteComponent, root);
    }

    renderCustomCssEditor() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.customCssComponent, root);
    }

    renderPluginPane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.contentComponent("plugins"), root);
    }

    renderThemePane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer-3QrUeG .standardSidebarView-3F1I7i");
            return;
        }
        BDV2.reactDom.render(this.contentComponent("themes"), root);
    }
}








































class V2C_Layer extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(window).on(`keyup.${this.props.id}`, e => {
            if (e.which === 27) {
                BDV2.reactDom.unmountComponentAtNode(this.refs.root.parentNode);
            }
        });

        $(`#${this.props.id}`).animate({opacity: 1}, {
            step: function(now) {
              $(this).css("transform", `scale(${1.1 - 0.1 * now}) translateZ(0px)`);
            },
            duration: 200,
            done: () => {$(`#${this.props.id}`).css("opacity", "").css("transform", "");}
        });
    }

    componentWillUnmount() {
        $(window).off(`keyup.${this.props.id}`);
        $(`#${this.props.id}`).animate({opacity: 0}, {
            step: function(now) {
              $(this).css("transform", `scale(${1.1 - 0.1 * now}) translateZ(0px)`);
            },
            duration: 200,
            done: () => {$(`#${this.props.rootId}`).remove();}
        });

        $("[class*=\"layer-\"]").removeClass("publicServersOpen").animate({opacity: 1}, {
            step: function(now) {
              $(this).css("transform", `scale(${0.07 * now + 0.93}) translateZ(0px)`);
            },
            duration: 200,
            done: () => {$("[class*=\"layer-\"]").css("opacity", "").css("transform", "");}
        });

    }

    componentWillMount() {
        $("[class*=\"layer-\"]").addClass("publicServersOpen").animate({opacity: 0}, {
            step: function(now) {
              $(this).css("transform", `scale(${0.07 * now + 0.93}) translateZ(0px)`);
            },
            duration: 200
        });
    }

    render() {
        return BDV2.react.createElement(
            "div",
            {className: "layer bd-layer layer-3QrUeG", id: this.props.id, ref: "root", style: {opacity: 0, transform: "scale(1.1) translateZ(0px)"}},
            this.props.children
        );
    }
}

class V2C_SidebarView extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let {sidebar, content, tools} = this.props.children;
        return BDV2.react.createElement(
            "div",
            {className: "standardSidebarView-3F1I7i ui-standard-sidebar-view"},
            BDV2.react.createElement(
                "div",
                {className: "sidebarRegion-VFTUkN sidebar-region"},
                BDV2.react.createElement(V2Components.Scroller, {key: "sidebarScroller", ref: "sidebarScroller", sidebar: true, fade: sidebar.fade || true, dark: sidebar.dark || true, children: sidebar.component})
            ),
            BDV2.react.createElement("div", {className: "contentRegion-3nDuYy content-region"},
                BDV2.react.createElement("div", {className: "contentTransitionWrap-3hqOEW content-transition-wrap"},
                    BDV2.react.createElement("div", {className: "scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix contentRegionScrollerWrap-3YZXdm content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv"},
                        BDV2.react.createElement("div", {className: "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix contentRegionScroller-26nc1e content-region-scroller scroller", ref: "contentScroller"},
                            BDV2.react.createElement("div", {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"}, content.component),
                            tools.component
                        )
                    )
                )
            )
        );
    }
}


class V2_PublicServers {

    constructor() {}

    get component() {
        return BDV2.react.createElement(V2Components.Layer, {rootId: "pubslayerroot", id: "pubslayer", children: BDV2.react.createElement(V2C_PublicServers, {rootId: "pubslayerroot"})});
    }

    get root() {
        let _root = document.getElementById("pubslayerroot");
        if (!_root) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root;
    }

    injectRoot() {
        if (!$(".layers, .layers-3iHuyZ").length) return false;
        $(".layers, .layers-3iHuyZ").append($("<div/>", {
            id: "pubslayerroot"
        }));
        return true;
    }

    render() {
        // BdApi.alert("Broken", "Sorry but the Public Servers modules is currently broken, I recommend disabling this feature for now.");
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layers");
            return;
        }
        BDV2.reactDom.render(this.component, root);
    }

    get button() {
        let btn = $("<div/>", {
            "class": BDV2.guildClasses.listItem,
            "id": "bd-pub-li",
            "style": settingsCookie["bda-gs-1"] ? "" : "display: none;"
        }).append($("<div/>", {
            "class": "wrapper-25eVIn " + BDV2.guildClasses.circleButtonMask,
            "text": "public",
            "id": "bd-pub-button",
            "click": () => { this.render(); }
        }));

        return btn;
    }

    initialize() {
        const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
        const guilds = $(`.${wrapper} .scroller-2FKFPG >:first-child`);
        guilds.after(this.button);
    }
}


class V2C_ServerCard extends BDV2.reactComponent {
    constructor(props) {
        super(props);
        if (!this.props.server.iconUrl) this.props.server.iconUrl = this.props.fallback;
        this.state = {
            imageError: false,
            joined: this.props.guildList.includes(this.props.server.identifier)
        };
    }

    render() {
        let {server} = this.props;
        return BDV2.react.createElement(
            "div", // cardPrimary-1Hv-to
            {className: `card-3Qj_Yx cardPrimary-1Hv-to marginBottom8-AtZOdT bd-server-card${server.pinned ? " bd-server-card-pinned" : ""}`},
            // BDV2.react.createElement(
                // "div",
                // { className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-3jynv6" },
                BDV2.react.createElement("img", {ref: "img", className: "bd-server-image", src: server.iconUrl, onError: this.handleError.bind(this)}),
                BDV2.react.createElement(
                    "div",
                    {className: "flexChild-faoVW3 bd-server-content"},
                    BDV2.react.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6 bd-server-header"},
                        BDV2.react.createElement(
                            "h5",
                            {className: "h5-18_1nd defaultColor-1_ajX0 margin-reset bd-server-name"},
                            server.name
                        ),
                        BDV2.react.createElement(
                            "h5",
                            {className: "h5-18_1nd defaultColor-1_ajX0 margin-reset bd-server-member-count"},
                            server.members,
                            " Members"
                        )
                    ),
                    BDV2.react.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6"},
                        BDV2.react.createElement(
                            "div",
                            {className: "scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y bd-server-description-container"},
                            BDV2.react.createElement(
                                "div",
                                {className: "scroller-2FKFPG scroller bd-server-description"},
                                    server.description
                            )
                        )
                    ),
                    BDV2.react.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6 bd-server-footer"},
                        BDV2.react.createElement(
                            "div",
                            {className: "flexChild-faoVW3 bd-server-tags", style: {flex: "1 1 auto"}},
                            server.categories.join(", ")
                        ),
                        this.state.joined && BDV2.react.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN colorGreen-29iAKY", style: {minHeight: "12px", marginTop: "4px", backgroundColor: "#3ac15c"}},
                            BDV2.react.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                "Joined"
                            )
                        ),
                        server.error && BDV2.react.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN disabled-9aF2ug", style: {minHeight: "12px", marginTop: "4px", backgroundColor: "#c13a3a"}},
                            BDV2.react.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                "Error"
                            )
                        ),
                        !server.error && !this.state.joined && BDV2.react.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN", style: {minHeight: "12px", marginTop: "4px"}, onClick: () => {this.join();}},
                            BDV2.react.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                "Join"
                            )
                        )
                    )
                )
            // )
        );
    }

    handleError() {
        this.props.server.iconUrl = this.props.fallback;
        this.setState({imageError: true});
    }

    join() {
        this.props.join(this);
        //this.setState({joined: true});
    }
}

class V2C_PublicServers extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.close = this.close.bind(this);
        this.changeCategory = this.changeCategory.bind(this);
        this.search = this.search.bind(this);
        this.searchKeyDown = this.searchKeyDown.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.join = this.join.bind(this);
        this.connect = this.connect.bind(this);

        this.GuildStore = BDV2.WebpackModules.findByUniqueProperties(["getGuilds"]);
        this.AvatarDefaults = BDV2.WebpackModules.findByUniqueProperties(["getUserAvatarURL", "DEFAULT_AVATARS"]);
        this.InviteActions = BDV2.WebpackModules.findByUniqueProperties(["acceptInvite"]);
        this.SortedGuildStore = BDV2.WebpackModules.findByUniqueProperties(["getSortedGuilds"]);
    }

    componentDidMount() {
        this.checkConnection();
     }

    setInitialState() {
        this.state = {
            selectedCategory: -1,
            title: "Loading...",
            loading: true,
            servers: [],
            next: null,
            connection: {
                state: 0,
                user: null
            }
        };
    }

    close() {
        BDV2.reactDom.unmountComponentAtNode(document.getElementById(this.props.rootId));
    }

    search(query, clear) {
        let self = this;

        $.ajax({
            method: "GET",
            url: `${self.endPoint}${query}${query ? "&schema=new" : "?schema=new"}`,
            success: data => {
                let servers = data.results.reduce((arr, server) => {
                    server.joined = false;
                    arr.push(server);
                    // arr.push(<V2Components.ServerCard server={server} join={self.join}/>);
                    return arr;
                }, []);

                if (!clear) {
                    servers = self.state.servers.concat(servers);
                }
                else {
                    //servers.unshift(self.bdServer);
                }

                let end = data.size + data.from;
                data.next = `?from=${end}`;
                if (self.state.term) data.next += `&term=${self.state.term}`;
                if (self.state.selectedCategory) data.next += `&category=${self.categoryButtons[self.state.selectedCategory]}`;
                if (end >= data.total) {
                    end = data.total;
                    data.next = null;
                }

                let title = `Showing 1-${end} of ${data.total} results in ${self.categoryButtons[self.state.selectedCategory]}`;
                if (self.state.term) title += ` for ${self.state.term}`;

                self.setState({
                    loading: false,
                    title: title,
                    servers: servers,
                    next: data.next
                });

                if (clear) {
                    //console.log(self);
                    self.refs.sbv.refs.contentScroller.scrollTop = 0;
                }
            },
            error: () => {
                self.setState({
                    loading: false,
                    title: "Failed to load servers. Check console for details"
                });
            }
        });
    }

    join(serverCard) {
        if (serverCard.props.pinned) return this.InviteActions.acceptInvite(serverCard.props.invite_code);
        $.ajax({
            method: "GET",
            url: `${this.joinEndPoint}/${serverCard.props.server.identifier}`,
            headers: {
                "Accept": "application/json;",
                "Content-Type": "application/json;" ,
                "x-discord-token": this.state.connection.user.accessToken
            },
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: () => {
                serverCard.setState({joined: true});
            }
        });
    }

    connect() {
        let self = this;
        let options = self.windowOptions;
        options.x = Math.round(window.screenX + window.innerWidth / 2 - options.width / 2);
        options.y = Math.round(window.screenY + window.innerHeight / 2 - options.height / 2);

        self.joinWindow = new (window.require("electron").remote.BrowserWindow)(options);
        const url = "https://auth.discordservers.com/connect?scopes=guilds.join&previousUrl=https://auth.discordservers.com/info";
        self.joinWindow.webContents.on("did-navigate", (event, url) => {
            if (url != "https://auth.discordservers.com/info") return;
            self.joinWindow.close();
            self.checkConnection();
        });
        self.joinWindow.loadURL(url);
    }

    get windowOptions() {
        return {
            width: 500,
            height: 550,
            backgroundColor: "#282b30",
            show: true,
            resizable: false,
            maximizable: false,
            minimizable: false,
            alwaysOnTop: true,
            frame: false,
            center: false,
            webPreferences: {
                nodeIntegration: false
            }
        };
    }

    get bdServer() {
        let server = {
            name: "BetterDiscord",
            online: "7500+",
            members: "20000+",
            categories: ["community", "programming", "support"],
            description: "Official BetterDiscord server for support etc",
            identifier: "86004744966914048",
            iconUrl: "https://cdn.discordapp.com/icons/86004744966914048/292e7f6bfff2b71dfd13e508a859aedd.webp",
            nativejoin: true,
            invite_code: "0Tmfo5ZbORCRqbAd",
            pinned: true
        };
        let guildList = this.SortedGuildStore.guildPositions;
        let defaultList = this.AvatarDefaults.DEFAULT_AVATARS;
        return BDV2.react.createElement(V2Components.ServerCard, {server: server, pinned: true, join: this.join, guildList: guildList, fallback: defaultList[Math.floor(Math.random() * 5)]});
    }

    get endPoint() {
        return "https://search.discordservers.com";
    }

    get joinEndPoint() {
        return "https://j.discordservers.com";
    }

    get connectEndPoint() {
        return "https://join.discordservers.com/connect";
    }

    checkConnection() {
        let self = this;
        try {
            $.ajax({
                method: "GET",
                url: `https://auth.discordservers.com/info`,
                headers: {
                    "Accept": "application/json;",
                    "Content-Type": "application/json;"
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: data => {
                    // Utils.log("PublicServer", "Got data: " + JSON.stringify(data));
                    self.setState({
                        selectedCategory: 0,
                        connection: {
                            state: 2,
                            user: data
                        }
                    });
                    self.search("", true);

                },
                error: () => {
                    self.setState({
                        title: "Not connected to discordservers.com!",
                        loading: true,
                        selectedCategory: -1,
                        connection: {
                            state: 1,
                            user: null
                        }
                    });
                }
            });
        }
        catch (error) {
            self.setState({
                title: "Not connected to discordservers.com!",
                loading: true,
                selectedCategory: -1,
                connection: {
                    state: 1,
                    user: null
                }
            });
        }
    }

    render() {
        return BDV2.react.createElement(V2Components.SidebarView, {ref: "sbv", children: this.component});
    }

    get component() {
        return {
            sidebar: {
                component: this.sidebar
            },
            content: {
                component: this.content
            },
            tools: {
                component: BDV2.react.createElement(V2Components.Tools, {key: "pt", ref: "tools", onClick: this.close})
            }
        };
    }

    get sidebar() {
        return BDV2.react.createElement(
            "div",
            {className: "sidebar", key: "ps"},
            BDV2.react.createElement(
                "div",
                {className: "ui-tab-bar SIDE"},
                BDV2.react.createElement(
                    "div",
                    {className: "ui-tab-bar-header", style: {fontSize: "16px"}},
                    "Public Servers"
                ),
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                this.searchInput,
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                BDV2.react.createElement(V2Components.TabBar.Header, {text: "Categories"}),
                this.categoryButtons.map((value, index) => {
                    return BDV2.react.createElement(V2Components.TabBar.Item, {id: index, onClick: this.changeCategory, key: index, text: value, selected: this.state.selectedCategory === index});
                }),
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                this.footer,
                this.connection
            )
        );
    }

    get searchInput() {
        return BDV2.react.createElement(
            "div",
            {className: "ui-form-item"},
            BDV2.react.createElement(
                "div",
                {className: "ui-text-input flex-vertical", style: {width: "172px", marginLeft: "10px"}},
                BDV2.react.createElement("input", {ref: "searchinput", onKeyDown: this.searchKeyDown, onChange: () => {}, type: "text", className: "input default", placeholder: "Search...", maxLength: "50"})
            )
        );
    }

    searchKeyDown(e) {
        let self = this;
        if (self.state.loading || e.which !== 13) return;
        self.setState({
            loading: true,
            title: "Loading...",
            term: e.target.value
        });
        let query = `?term=${e.target.value}`;
        if (self.state.selectedCategory !== 0) {
            query += `&category=${self.categoryButtons[self.state.selectedCategory]}`;
        }
        self.search(query, true);
    }

    get categoryButtons() {
        return ["All", "FPS Games", "MMO Games", "Strategy Games", "MOBA Games", "RPG Games", "Tabletop Games", "Sandbox Games", "Simulation Games", "Music", "Community", "Language", "Programming", "Other"];
    }

    changeCategory(id) {
        let self = this;
        if (self.state.loading) return;
        self.refs.searchinput.value = "";
        self.setState({
            loading: true,
            selectedCategory: id,
            title: "Loading...",
            term: null
        });
        if (id === 0) {
            self.search("", true);
            return;
        }
        self.search(`?category=${self.categoryButtons[id]}`, true);
    }

    get content() {
        let self = this;
        let guildList = this.SortedGuildStore.guildPositions;
        let defaultList = this.AvatarDefaults.DEFAULT_AVATARS;
        if (self.state.connection.state === 1) return self.notConnected;
        return [BDV2.react.createElement(
            "div",
            {ref: "content", key: "pc", className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(V2Components.SettingsTitle, {text: self.state.title}),
            self.bdServer,
            self.state.servers.map((server) => {
                return BDV2.react.createElement(V2Components.ServerCard, {key: server.identifier, server: server, join: self.join, guildList: guildList, fallback: defaultList[Math.floor(Math.random() * 5)]});
            }),
            self.state.next && BDV2.react.createElement(
                "button",
                {type: "button", onClick: () => {
                        if (self.state.loading) return;self.setState({loading: true}); self.search(self.state.next, false);
                    }, className: "ui-button filled brand small grow", style: {width: "100%", marginTop: "10px", marginBottom: "10px"}},
                BDV2.react.createElement(
                    "div",
                    {className: "ui-button-contents"},
                    self.state.loading ? "Loading" : "Load More"
                )
            ),
            self.state.servers.length > 0 && BDV2.react.createElement(V2Components.SettingsTitle, {text: self.state.title})
        )];
    }

    get notConnected() {
        let self = this;
        //return BDV2.react.createElement(V2Components.SettingsTitle, { text: self.state.title });
        return [BDV2.react.createElement(
            "div",
            {key: "ncc", ref: "content", className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"},
            BDV2.react.createElement(
                "h2",
                {className: "ui-form-title h2 margin-reset margin-bottom-20"},
                "Not connected to discordservers.com!",
                BDV2.react.createElement(
                    "button",
                    {
                        onClick: self.connect,
                        type: "button",
                        className: "ui-button filled brand small grow",
                        style: {
                            display: "inline-block",
                            minHeight: "18px",
                            marginLeft: "10px",
                            lineHeight: "14px"
                        }
                    },
                    BDV2.react.createElement(
                        "div",
                        {className: "ui-button-contents"},
                        "Connect"
                    )
                )
            ), self.bdServer
        )];
    }

    get footer() {
        return BDV2.react.createElement(
            "div",
            {className: "ui-tab-bar-header"},
            BDV2.react.createElement(
                "a",
                {href: "https://discordservers.com", target: "_blank"},
                "Discordservers.com"
            )
        );
    }

    get connection() {
        let self = this;
        let {connection} = self.state;
        if (connection.state !== 2) return BDV2.react.createElement("span", null);

        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(V2Components.TabBar.Separator, null),
            BDV2.react.createElement(
                "span",
                {style: {color: "#b9bbbe", fontSize: "10px", marginLeft: "10px"}},
                "Connected as: ",
                `${connection.user.username}#${connection.user.discriminator}`
            ),
            BDV2.react.createElement(
                "div",
                {style: {padding: "5px 10px 0 10px"}},
                BDV2.react.createElement(
                    "button",
                    {style: {width: "100%", minHeight: "20px"}, type: "button", className: "ui-button filled brand small grow"},
                    BDV2.react.createElement(
                        "div",
                        {className: "ui-button-contents", onClick: self.connect},
                        "Reconnect"
                    )
                )
            )
        );
}
}
