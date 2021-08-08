import { makeObservable, observable, action } from 'mobx';
import RootContext from '../contexts';

export default class ModalStore {
    walletModalVisible: boolean;
    context: RootContext;

    constructor(context) {
        this.context = context;
        this.walletModalVisible = false;
        makeObservable(this, {
            walletModalVisible: observable,
            toggleWalletModal: action,
            setWalletModalVisible: action
          }
        );
    }

    @action toggleWalletModal() {
        this.walletModalVisible = !this.walletModalVisible;
    }

    @action setWalletModalVisible(visible: boolean) {
        this.walletModalVisible = visible;
    }
}
