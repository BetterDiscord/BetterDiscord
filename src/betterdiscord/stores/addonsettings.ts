import Store from "@stores/base";
import type {AddonType} from "@typed/addon";

class AddonSettingsRoute extends Store {
    prefix: AddonType | null = null;
    id: string | null = null;
    pendingStore: AddonType | null = null;

    open(prefix: AddonType, id: string) {
        this.prefix = prefix;
        this.id = id;
        this.pendingStore = null;
        this.emitChange();
    }

    close() {
        if (!this.prefix && !this.id) return;
        this.prefix = null;
        this.id = null;
        this.emitChange();
    }

    openStore(prefix: AddonType) {
        this.prefix = null;
        this.id = null;
        this.pendingStore = prefix;
        this.emitChange();
    }

    consumeStore(prefix: AddonType) {
        if (this.pendingStore !== prefix) return;
        this.pendingStore = null;
        this.emitChange();
    }
}

export default new AddonSettingsRoute();
