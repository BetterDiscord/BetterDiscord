import Builtin, {onSettingChange} from "../structs/builtin";
import {SettingsCookie} from "data";

export default new class MinimalMode extends Builtin {
    get name() {return "MinimalMode";}
    get group() {return "appearance";}
    get id() {return "bda-gs-2";}
    get hideChannelsID() {return "bda-gs-3";}
    get hideChannels() {return SettingsCookie[this.hideChannelsID];}

    constructor() {
        super();
        this.enableHideChannels = this.enableHideChannels.bind(this);
        this.disableHideChannels = this.disableHideChannels.bind(this);
    }

    enabled() {
        $("body").addClass("bd-minimal");
        if (this.hideChannels) this.enableHideChannels();
        this.hideChannelCancel = onSettingChange(this.category, this.hideChannelsID, this.enableHideChannels, this.disableHideChannels);
    }

    disabled() {
        $("body").removeClass("bd-minimal");
        if (this.hideChannels) this.disableHideChannels();
        if (this.hideChannelCancel) this.hideChannelCancel();
    }

    enableHideChannels() {
        $("body").addClass("bd-minimal-chan");
    }

    disableHideChannels() {
        $("body").removeClass("bd-minimal-chan");
    }
};