import {React} from "modules";

export default class CloseButton extends React.Component {
    render() {
        return <svg viewBox="0 0 12 12" style={{width: "18px", height: "18px"}}>
            <g className="background" fill="none" fillRule="evenodd">
                <path d="M0 0h12v12H0" />
                <path className="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6" />
            </g>
        </svg>;
    }
}