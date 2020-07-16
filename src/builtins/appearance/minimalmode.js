import Builtin from "../../structs/builtin";

export default new class MinimalMode extends Builtin {
    get name() {return "MinimalMode";}
    get category() {return "appearance";}
    get id() {return "minimalMode";}
    get hideChannelsID() {return "hideChannels";}
    get hideChannels() {return this.get(this.hideChannelsID);}

    constructor() {
        super();
        this.enableHideChannels = this.enableHideChannels.bind(this);
        this.disableHideChannels = this.disableHideChannels.bind(this);
    }

    enabled() {
        document.body.classList.add("bd-minimal");
        if (this.hideChannels) this.enableHideChannels();
        this.hideChannelCancel = this.registerSetting(this.hideChannelsID, this.enableHideChannels, this.disableHideChannels);
    }

    disabled() {
        document.body.classList.remove("bd-minimal");
        if (this.hideChannels) this.disableHideChannels();
        if (this.hideChannelCancel) this.hideChannelCancel();
    }

    enableHideChannels() {
        document.body.classList.add("bd-minimal-chan");
    }

    disableHideChannels() {
        document.body.classList.remove("bd-minimal-chan");
    }
};