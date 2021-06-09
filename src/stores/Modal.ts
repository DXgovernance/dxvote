import { makeObservable, observable, action } from 'mobx';
import RootStore from 'stores';

export default class ModalStore {
    walletModalVisible: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
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
