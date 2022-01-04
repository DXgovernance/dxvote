import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import Common, { Chain, Hardfork } from '@ethereumjs/common';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import RootContext from '../contexts';
import { toEthSignedMessageHash, arrayBufferHex } from 'utils';

export default class MessageLoggerService {
  context: RootContext;
  userWeb3Context: Web3ReactContextInterface;
  rinkebyWeb3Context: Web3ReactContextInterface;

  messageLoggerAddress: string = '0xA490faF0DC4F26101a15bAc6ECad55b59db014a7';
  messageLoggerABI: Object = [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'topic',
          type: 'bytes32',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'message',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
      ],
      name: 'Message',
      type: 'event',
    },
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'DOMAIN_SEPARATORS',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'PERMIT_TYPEHASH',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'bytes32', name: 'topic', type: 'bytes32' },
        { internalType: 'string', name: 'message', type: 'string' },
      ],
      name: 'broadcast',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'bytes32', name: 'topic', type: 'bytes32' },
        { internalType: 'string', name: 'message', type: 'string' },
        { internalType: 'uint256', name: 'chainId', type: 'uint256' },
        { internalType: 'uint8', name: 'v', type: 'uint8' },
        { internalType: 'bytes32', name: 'r', type: 'bytes32' },
        { internalType: 'bytes32', name: 's', type: 'bytes32' },
      ],
      name: 'broadcastEIP712',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'bytes32', name: 'topic', type: 'bytes32' },
        { internalType: 'string', name: 'message', type: 'string' },
        { internalType: 'address', name: 'sender', type: 'address' },
      ],
      name: 'broadcastPublic',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];
  fromBlock: number = 9904867;

  constructor(context: RootContext) {
    this.context = context;
    this.rinkebyWeb3Context = null;
  }

  getMessageLoggerWeb3Context(): Web3ReactContextInterface {
    return this.rinkebyWeb3Context;
  }

  setUserWeb3Context(context: Web3ReactContextInterface) {
    this.userWeb3Context = context;
  }

  setRinkebyWeb3Context(context: Web3ReactContextInterface) {
    this.rinkebyWeb3Context = context;
  }

  async broadcastVote(
    votingMachineAddress: string,
    proposalId: string,
    decision: string,
    repAmount: string
  ) {
    const rinkebyWeb3 = this.rinkebyWeb3Context.library;
    const messageLogger = new rinkebyWeb3.eth.Contract(
      this.messageLoggerABI,
      this.messageLoggerAddress
    );
    const { account } = this.context.providerStore.getActiveWeb3React();
    const common = new Common({
      chain: Chain.Rinkeby,
      hardfork: Hardfork.London,
    });

    // Step 1: The Vote is hashed, and the hash is signed.
    // keccak256(abi.encodePacked( votingMachine, proposalId, voter, voteDecision, amount ));
    const hashedVote = this.context.daoService.hashVote(
      votingMachineAddress,
      proposalId,
      account,
      decision,
      repAmount
    );
    console.log('Hashed vote:', hashedVote);

    let voteSignature = await this.context.providerStore.sign(
      this.context.providerStore.getActiveWeb3React(),
      toEthSignedMessageHash(hashedVote)
    );

    console.log('Vote signature object:', voteSignature);

    // Step 2: Create the TX to send in rinkeby with the signature of the vote.
    let txData = {
      from: account,
      data: messageLogger.methods
        .broadcast(
          rinkebyWeb3.utils.sha3(`dxvote:${proposalId}`),
          `signedVote:${votingMachineAddress}:${proposalId}:${account}:${decision}:${repAmount}:${voteSignature.result}`
        )
        .encodeABI(),
      nonce: rinkebyWeb3.utils.numberToHex(
        await rinkebyWeb3.eth.getTransactionCount(account)
      ),
      gasLimit: rinkebyWeb3.utils.numberToHex('500000'),
      maxPriorityFeePerGas: rinkebyWeb3.utils.numberToHex('10000000000'),
      maxFeePerGas: rinkebyWeb3.utils.numberToHex('10000000000'),
      to: this.messageLoggerAddress,
      type: '0x02',
      chainId: '0x04',
      DEFAULT_CHAIN: 'rinkeby',
    };

    const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });
    const unsignedTx = tx.getMessageToSign(false);
    console.log('Unsigned Rinkeby tx:', tx);

    // Step 3: Sign the transaction with the vote signature to be shared in rinkeby executing a tx in rinkeby network
    let signature = await this.context.providerStore.sign(
      this.context.providerStore.getActiveWeb3React(),
      rinkebyWeb3.utils.sha3('0x' + arrayBufferHex(unsignedTx))
    );

    // Step 3: Send the raw transaction signed to the rinkeby network
    if (signature.result) {
      signature = signature.result.substr(2);
      const r = '0x' + signature.substr(0, 64);
      const s = '0x' + signature.substr(64, 64);
      const v = signature.substr(128) == "1c" ? "0x1" : "0x0";
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

      rinkebyWeb3.eth
        .sendSignedTransaction('0x' + signedTx.serialize().toString('hex'))
        .once('sending', function (payload) {
          console.log('sending', payload);
        })
        .once('sent', function (payload) {
          console.log('sent', payload);
        })
        .once('transactionHash', function (hash) {
          console.log('tx hash', hash);
        })
        .once('receipt', function (receipt) {
          console.log('receipt', receipt);
        })
        .on('error', function (error) {
          console.log('error', error);
        });
    }
  }

  async getMessages(topic: string) {
    const web3 = this.rinkebyWeb3Context.library;
    const messageLogger = new web3.eth.Contract(
      this.messageLoggerABI,
      this.messageLoggerAddress
    );
    const events = await messageLogger.getPastEvents('Message', {
      fromBlock: this.fromBlock,
      filter: {
        topic: web3.utils.sha3(topic),
      },
    });
    return events;
  }
}
