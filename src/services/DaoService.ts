import { action, makeObservable } from 'mobx';
import contentHash from 'content-hash';
import PromiEvent from 'promievent';
import RootContext from '../contexts';
import { ContractType } from '../stores/Provider';
import {
  BigNumber,
  bnum,
  ZERO_ADDRESS,
  ANY_ADDRESS,
  ERC20_TRANSFER_SIGNATURE,
  ERC20_APPROVE_SIGNATURE,
  MAX_UINT,
  normalizeBalance,
} from '../utils';

export default class DaoService {
  context: RootContext;

  constructor(context: RootContext) {
    this.context = context;

    makeObservable(this, {
      createProposal: action,
      vote: action,
      approveVotingMachineToken: action,
      stake: action,
      execute: action,
      redeem: action,
    });
  }

  encodeControllerGenericCall(to: string, callData: string, value: BigNumber) {
    const { providerStore, configStore } = this.context;
    const controller = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.Controller,
      configStore.getNetworkContracts().controller
    );
    const avatarAddress = configStore.getNetworkContracts().avatar;
    return controller.methods
      .genericCall(to, callData, avatarAddress, value)
      .encodeABI();
  }

  async decodeWalletSchemeCall(
    from: string,
    to: string,
    data: string,
    value: BigNumber,
    fullDescription: boolean
  ) {
    const { abiService, providerStore, configStore } = this.context;
    const { library } = providerStore.getActiveWeb3React();
    const recommendedCalls = configStore.getRecommendedCalls();
    let functionSignature = data.substring(0, 10);
    const controllerCallDecoded = await abiService.decodeCall(
      data,
      ContractType.Controller
    );
    const decodeEtherscanCallData = await abiService.decodeCall(
      data,
      ContractType.Controller,
      to
    );

    if (decodeEtherscanCallData) {
      return `
     <strong>From</strong>: ${from} \n 
      <strong>To</strong>: ${to} \n
        <strong>Function</strong>: ${decodeEtherscanCallData.function.name} \n
      </small> 
        <strong>Params</strong>: \n ${Object.keys(decodeEtherscanCallData.args)
          .filter(item => item != '__length__')
          .map((item, i) => {
            return `<bold>${decodeEtherscanCallData.function.inputs[
              i
            ].name.replace(/[^a-zA-Z0-9]/g, '')}</bold>: \n <small>${
              decodeEtherscanCallData.args[item]
            } </small> \n\n`;
          })
          .join('')}
           `;
    }
    let asset = ZERO_ADDRESS;
    if (
      controllerCallDecoded &&
      controllerCallDecoded.function.name === 'genericCall'
    ) {
      to = controllerCallDecoded.args[0];
      data = '0x' + controllerCallDecoded.args[1].substring(10);
      value = bnum(controllerCallDecoded.args[3]);
      functionSignature = controllerCallDecoded.args[1].substring(0, 10);
    } else {
      data = '0x' + data.substring(10);
    }

    if (
      functionSignature === ERC20_TRANSFER_SIGNATURE ||
      functionSignature === ERC20_APPROVE_SIGNATURE
    ) {
      asset = to;
    }
    const recommendedCallUsed = recommendedCalls.find(recommendedCall => {
      return (
        asset === recommendedCall.asset &&
        (ANY_ADDRESS === recommendedCall.from ||
          from === recommendedCall.from) &&
        to === recommendedCall.to &&
        functionSignature ===
          library.eth.abi.encodeFunctionSignature(recommendedCall.functionName)
      );
    });

    if (recommendedCallUsed) {
      const callParameters = library.eth.abi.decodeParameters(
        recommendedCallUsed.params.map(param => param.type),
        data
      );

      if (callParameters.__length__) delete callParameters.__length__;

      let decodedCallText = '';

      if (
        recommendedCallUsed.decodeText &&
        recommendedCallUsed.decodeText.length > 0
      ) {
        decodedCallText = recommendedCallUsed.decodeText;
        for (
          let paramIndex = 0;
          paramIndex < recommendedCallUsed.params.length;
          paramIndex++
        )
          if (recommendedCallUsed.params[paramIndex].decimals)
            decodedCallText = decodedCallText.replaceAll(
              '[PARAM_' + paramIndex + ']',
              '<italic>' +
                normalizeBalance(
                  callParameters[paramIndex],
                  recommendedCallUsed.params[paramIndex].decimals
                ) +
                '</italic>'
            );
          else
            decodedCallText = decodedCallText.replaceAll(
              '[PARAM_' + paramIndex + ']',
              '<italic>' + callParameters[paramIndex] + '</italic>'
            );
      }

      if (fullDescription) {
        return `<strong>Description</strong>:${decodedCallText}
        <strong>To</strong>: ${recommendedCallUsed.toName} <small>${
          recommendedCallUsed.to
        }</small>
        <strong>Function</strong>: ${
          recommendedCallUsed.functionName
        } <small>${library.eth.abi.encodeFunctionSignature(
          recommendedCallUsed.functionName
        )}</small>
        <strong>Params</strong>: ${JSON.stringify(
          Object.keys(callParameters).map(
            paramIndex => callParameters[paramIndex]
          )
        )}
        <strong>Data</strong>: ${data} `;
      } else {
        return decodedCallText;
      }
    } else {
      return `<strong>From</strong>: ${from}
      <strong>To</strong>: ${to}
      <strong>Data</strong>: 0x${data.substring(10)}
      <strong>Value</strong>: ${normalizeBalance(bnum(value))}`;
    }
  }

  createProposal(
    scheme: string,
    schemeType: string,
    proposalData: any
  ): PromiEvent<any> {
    const { providerStore, configStore } = this.context;
    const networkContracts = configStore.getNetworkContracts();
    const { library } = providerStore.getActiveWeb3React();

    if (schemeType === 'ContributionReward') {
      // function proposeContributionReward(
      //   Avatar _avatar,
      //   string memory _descriptionHash,
      //   int256 _reputationChange,
      //   uint256[5] memory _rewards,
      //   IERC20 _externalToken,
      //   address payable _beneficiary
      // )
      return providerStore.sendRawTransaction(
        providerStore.getActiveWeb3React(),
        scheme,
        library.eth.abi.encodeFunctionCall(
          {
            name: 'proposeContributionReward',
            type: 'function',
            inputs: [
              { type: 'address', name: '_avatar' },
              { type: 'string', name: '_descriptionHash' },
              { type: 'int256', name: '_reputationChange' },
              { type: 'uint256[5]', name: '_rewards' },
              { type: 'address', name: '_externalToken' },
              { type: 'address', name: '_beneficiary' },
            ],
          },
          [
            networkContracts.avatar,
            contentHash.decode(proposalData.descriptionHash),
            proposalData.reputationChange,
            [0, proposalData.ethValue, proposalData.tokenValue, 0, 1],
            proposalData.externalToken,
            proposalData.beneficiary,
          ]
        ),
        '0'
      );
    } else if (schemeType === 'GenericMulticall') {
      // function proposeCalls(
      //   address[] memory _contractsToCall,
      //   bytes[] memory _callsData,
      //   uint256[] memory _values,
      //   string memory _descriptionHash
      // )
      return providerStore.sendRawTransaction(
        providerStore.getActiveWeb3React(),
        scheme,
        library.eth.abi.encodeFunctionCall(
          {
            name: 'proposeCalls',
            type: 'function',
            inputs: [
              { type: 'address[]', name: '_contractsToCall' },
              { type: 'bytes[]', name: '_callsData' },
              { type: 'uint256[]', name: '_values' },
              { type: 'string', name: '_descriptionHash' },
            ],
          },
          [
            proposalData.to,
            proposalData.data,
            proposalData.value,
            contentHash.decode(proposalData.descriptionHash),
          ]
        ),
        '0'
      );
    } else {
      return providerStore.sendTransaction(
        providerStore.getActiveWeb3React(),
        ContractType.WalletScheme,
        scheme,
        'proposeCalls',
        [
          proposalData.to,
          proposalData.data,
          proposalData.value,
          proposalData.titleText,
          proposalData.descriptionHash,
        ],
        {}
      );
    }
  }

  vote(decision: string, amount: string, proposalId: string): PromiEvent<any> {
    const { providerStore, daoStore } = this.context;
    const { account } = providerStore.getActiveWeb3React();
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      daoStore.getVotingMachineOfProposal(proposalId),
      'vote',
      [proposalId, decision, amount, account],
      {}
    );
  }

  approveVotingMachineToken(votingMachineAddress): PromiEvent<any> {
    const { providerStore, daoStore } = this.context;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.ERC20,
      daoStore.getCache().votingMachines[votingMachineAddress].token,
      'approve',
      [votingMachineAddress, MAX_UINT],
      {}
    );
  }

  stake(decision: string, amount: string, proposalId: string): PromiEvent<any> {
    const { providerStore, daoStore } = this.context;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      daoStore.getVotingMachineOfProposal(proposalId),
      'stake',
      [proposalId, decision, amount],
      {}
    );
  }

  execute(proposalId: string): PromiEvent<any> {
    const { providerStore, daoStore } = this.context;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      daoStore.getVotingMachineOfProposal(proposalId),
      'execute',
      [proposalId],
      {}
    );
  }

  redeem(proposalId: string, account: string): PromiEvent<any> {
    const { providerStore, daoStore } = this.context;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      daoStore.getVotingMachineOfProposal(proposalId),
      'redeem',
      [proposalId, account],
      {}
    );
  }

  redeemDaoBounty(proposalId: string, account: string): PromiEvent<any> {
    const { providerStore, daoStore } = this.context;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      daoStore.getVotingMachineOfProposal(proposalId),
      'redeemDaoBounty',
      [proposalId, account],
      {}
    );
  }

  redeemContributionReward(
    redeemerAddress: string,
    votingMachineAddress: string,
    schemeAddress: string,
    proposalId: string,
    beneficiary: string
  ): PromiEvent<any> {
    const { providerStore, configStore } = this.context;
    // I have NO IDEA why it works with the voting machine address and scheme address are inverted in the function call,
    // Alchemy uses it like that, weird.
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.Redeemer,
      redeemerAddress,
      'redeem',
      [
        votingMachineAddress,
        schemeAddress,
        proposalId,
        configStore.getNetworkContracts().avatar,
        beneficiary,
      ],
      {}
    );
  }

  redeemContributionRewardCall(
    redeemerAddress: string,
    votingMachineAddress: string,
    schemeAddress: string,
    proposalId: string,
    beneficiary: string
  ): PromiEvent<any> {
    const { providerStore, configStore } = this.context;
    const web3 = providerStore.getActiveWeb3React().library;
    return web3.eth.call({
      to: redeemerAddress,
      data: web3.eth.abi.encodeFunctionCall(
        {
          name: 'redeem',
          type: 'function',
          inputs: [
            {
              type: 'address',
              name: '_contributionReward',
            },
            {
              type: 'address',
              name: '_genesisProtocol',
            },
            {
              type: 'bytes32',
              name: '_proposalId',
            },
            {
              type: 'address',
              name: '_avatar',
            },
            {
              type: 'address',
              name: '_beneficiary',
            },
          ],
        },
        [
          votingMachineAddress,
          schemeAddress,
          proposalId,
          configStore.getNetworkContracts().avatar,
          beneficiary,
        ]
      ),
    });
  }

  executeMulticall(schemeAddress: string, proposalId: string): PromiEvent<any> {
    const { providerStore } = this.context;
    const web3 = providerStore.getActiveWeb3React().library;
    return providerStore.sendRawTransaction(
      providerStore.getActiveWeb3React(),
      schemeAddress,
      web3.eth.abi.encodeFunctionCall(
        {
          name: 'execute',
          type: 'function',
          inputs: [
            {
              type: 'bytes32',
              name: '_proposalId',
            },
          ],
        },
        [proposalId]
      ),
      '0'
    );
  }
}
