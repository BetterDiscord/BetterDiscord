import {React} from "modules";

const flexContainer = "flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 switchItem-2hKKKK";
const flexWrap = "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6";
const flexChild = "flexChild-faoVW3";
const title = "titleDefault-a8-ZSr title-31JmR4 da-titleDefault da-title";
const switchWrapper = "flexChild-faoVW3 da-flexChild switchEnabled-V2WDBB switch-3wwwcV da-switchEnabled da-switch valueUnchecked-2lU_20 value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX";
const switchWrapperChecked = "flexChild-faoVW3 da-flexChild switchEnabled-V2WDBB switch-3wwwcV da-switchEnabled da-switch valueChecked-m-4IJZ value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX";
const switchClass = "checkboxEnabled-CtinEn checkbox-2tyjJg";
const description = "description-3_Ncsb formText-3fs7AJ note-1V3kyJ modeDefault-3a2Ph1 primary-jw0I4K";
const divider = "divider-3573oO dividerDefault-3rvLe-";

export default class Switch extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            checked: this.props.checked
        };
    }

    onChange() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            checked: !this.state.checked
        });
    }

    render() {
        return <div className={flexContainer} style={{flex: "1 1 auto"}}>
                    <div className={flexWrap} style={{flex: "1 1 auto"}}>
                        <div className={flexChild} style={{flex: "1 1 auto"}}>
                            <label htmlFor={this.props.id} className={title}>{this.props.name || this.props.data.text}</label>
                        </div>
                        <div className={this.state.checked ? switchWrapperChecked : switchWrapper} tabIndex="0" style={{flex: "0 0 auto"}}>
                            <input id={this.props.id} className={switchClass} type="checkbox" tabIndex="-1" checked={this.state.checked} onChange={e => this.onChange(e)} />
                        </div>
                    </div>
                    <div className={description} style={{flex: "1 1 auto"}}>{this.props.note || this.props.data.info}</div>
                    <div className={divider} />
                </div>;
    }
}

// export default class V2C_Switch extends React.Component {

//     constructor(props) {
//         super(props);
//         this.setInitialState();
//         this.onChange = this.onChange.bind(this);
//     }

//     setInitialState() {
//         this.state = {
//             checked: this.props.checked
//         };
//     }

//     render() {
//         const {text, info} = this.props.data;
//         const {checked} = this.state;
//         return React.createElement(
//             "div",
//             {className: `ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item ${flexContainer}`},
//             React.createElement(
//                 "div",
//                 {className: `ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap ${flexWrap}`},
//                 React.createElement(
//                     "h3",
//                     {className: `ui-form-title h3 margin-reset margin-reset ui-flex-child ${title} ${flexChild}`},
//                     text
//                 ),
//                 React.createElement(
//                     "div",
//                     {className: `ui-switch-wrapper ui-flex-child ${checked ? switchWrapperChecked : switchWrapper}`, style: {flex: "0 0 auto"}},
//                     React.createElement("input", {className: `ui-switch-checkbox ${switchClass}`, type: "checkbox", checked: checked, onChange: e => this.onChange(e)}),
//                     React.createElement("div", {className: `ui-switch ${checked ? "checked" : ""}`})
//                 )
//             ),
//             React.createElement(
//                 "div",
//                 {className: `ui-form-text style-description margin-top-4 ${description}`, style: {flex: "1 1 auto"}},
//                 info
//             )
//         );
//     }

//     onChange() {
//         this.props.onChange(this.props.id, !this.state.checked);
//         this.setState({
//             checked: !this.state.checked
//         });
//     }
// }