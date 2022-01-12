import Common, { Chain, Hardfork } from '@ethereumjs/common';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import RootContext from '../contexts';
import { arrayBufferHex } from 'utils';
import { ethers, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

export default class MessageLoggerService {
  context: RootContext;

  messageLoggerAddress: string = '0xA490faF0DC4F26101a15bAc6ECad55b59db014a7';
  messageLoggerABI: ethers.utils.Interface = new ethers.utils.Interface([
    'event Message(bytes32 indexed topic, string message, address sender)',
    'function broadcast(bytes32 topic, string message)',
  ]);
  fromBlock: number = 9904867;

  constructor(context: RootContext) {
    this.context = context;
  }

  async broadcast(
    topic: string,
    message: string,
    rinkebyWeb3: JsonRpcProvider
  ) {
    const { account } = this.context.providerStore.getActiveWeb3React();
    const common = new Common({
      chain: Chain.Rinkeby,
      hardfork: Hardfork.London,
    });

    // Step 1: Create the TX to send in rinkeby with the signature of the vote.
    let txData = {
      from: account,
      data: this.messageLoggerABI.encodeFunctionData('broadcast', [
        topic,
        message,
      ]),
      nonce: await rinkebyWeb3.getTransactionCount(account),
      gasLimit: 50000,
      maxPriorityFeePerGas: 1000000000,
      maxFeePerGas: 1000000000,
      to: this.messageLoggerAddress,
      value: 0,
      type: '0x02',
      chainId: '0x04',
      DEFAULT_CHAIN: 'rinkeby',
    };

    const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });
    const unsignedTx = tx.getMessageToSign(false);
    console.log('Unsigned Rinkeby tx:', tx);

    // Step 2: Sign the transaction with the vote signature to be shared in rinkeby executing a tx in rinkeby network
    let signature = await this.context.providerStore.sign(
      this.context.providerStore.getActiveWeb3React(),
      utils.keccak256('0x' + arrayBufferHex(unsignedTx))
    );

    // Step 3: Send the raw transaction signed to the rinkeby network
    if (signature.result) {
      signature = signature.result.substr(2);
      const r = '0x' + signature.substr(0, 64);
      const s = '0x' + signature.substr(64, 64);
      const v = signature.substr(128) == '1c' ? '0x1' : '0x0';
      console.log('Rinkeby tx object:', txData);
      console.log(`Rinkeby tx signature: ${v}${r}${s}`);

      const signedTx = FeeMarketEIP1559Transaction.fromTxData({
        ...txData,
        v,
        r,
        s,
      });
      const from = signedTx.getSenderAddress().toString();
      console.log(
        `Signed Rinkeby tx hex: ${signedTx
          .serialize()
          .toString('hex')}\n Rinkeby tx Signer: ${from}`
      );

      rinkebyWeb3.send('eth_sendRawTransaction', [
        '0x' + signedTx.serialize().toString('hex'),
      ]);
    }
  }

  async getMessages(topic: string, rinkebyWeb3: JsonRpcProvider) {
    const messageLogger = new ethers.Contract(
      this.messageLoggerAddress,
      this.messageLoggerABI,
      rinkebyWeb3
    );

    const filter = messageLogger.filters.Message(topic);

    const events = await messageLogger.queryFilter(
      filter,
      this.fromBlock,
      await rinkebyWeb3.getBlockNumber()
    );
    return events;
  }
}
