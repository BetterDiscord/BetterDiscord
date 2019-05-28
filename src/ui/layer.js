export default class V2C_Layer extends BDV2.reactComponent {

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