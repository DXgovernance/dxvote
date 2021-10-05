import { makeObservable, observable, action } from 'mobx';
import RootContext from '../contexts';

export default class ModalStore {
  walletModalVisible: boolean;
  networkModalVisible: boolean;
  context: RootContext;

  constructor(context) {
    this.context = context;
    this.walletModalVisible = false;
    this.networkModalVisible = false;
    makeObservable(this, {
      walletModalVisible: observable,
      toggleWalletModal: action,
      setWalletModalVisible: action,
      networkModalVisible: observable,
      toggleNetworkModal: action,
      setNetworkModalVisible: action,
    });
  }

  @action toggleWalletModal() {
    this.walletModalVisible = !this.walletModalVisible;
  }

  @action setWalletModalVisible(visible: boolean) {
    this.walletModalVisible = visible;
  }

  @action toggleNetworkModal() {
    this.networkModalVisible = !this.networkModalVisible;
  }

  @action setNetworkModalVisible(visible: boolean) {
    this.networkModalVisible = visible;
  }
}
