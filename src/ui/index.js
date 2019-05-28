export default class V2Components {
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