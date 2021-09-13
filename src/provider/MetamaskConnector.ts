import { InjectedConnector } from '@web3-react/injected-connector';
import { AbstractConnectorArguments } from '@web3-react/types';

export class MetamaskConnector extends InjectedConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);
  }
  public async isAuthorized(): Promise<boolean> {
    // @ts-ignore
    if (!window.ethereum) {
      return false;
    }

    try {
      const provider = await this.getProvider();
      return !!(provider && provider['selectedAddress']);
    } catch {
      return false;
    }
  }
}
