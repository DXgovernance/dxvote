import RootContext from 'contexts';
import { action, makeObservable, observable } from 'mobx';

export enum GlobalLoadingState {
  HIDDEN,
  LOADING,
  ERROR,
}

export default class NotificationStore {
  globalLoadingState: GlobalLoadingState = GlobalLoadingState.HIDDEN;
  globalMessage: string;

  context: RootContext;

  constructor(context) {
    this.context = context;
    makeObservable(this, {
      globalLoadingState: observable,
      globalMessage: observable,
      reset: action,
      setGlobalError: action,
      setGlobalLoading: action,
    });
  }

  reset() {
    this.globalLoadingState = GlobalLoadingState.LOADING;
    this.globalMessage = null;
  }

  setGlobalLoading(visible: boolean, message?: string) {
    this.globalLoadingState = visible
      ? GlobalLoadingState.LOADING
      : GlobalLoadingState.HIDDEN;
    this.globalMessage = message;
  }

  setGlobalError(visible: boolean, message?: string) {
    this.globalLoadingState = visible
      ? GlobalLoadingState.ERROR
      : GlobalLoadingState.HIDDEN;
    this.globalMessage = message;
  }
}
