import Store from "@stores/base";
import type {ToastProps} from "@ui/toasts/ToastContainer";

export default new class Toasts extends Store {
    private _toasts: ToastProps[] = [];

    addToast(toast: ToastProps) {
        this._toasts = [...this._toasts, toast];
        this.emit();

        setTimeout(() => {
            this.removeToast(toast.key);
        }, toast.timeout);
    }

    removeToast(key: number) {
        this._toasts = this._toasts.filter(toast => toast.key !== key);
        this.emit();
    }

    get toasts(): ToastProps[] {
        return this._toasts;
    }
};