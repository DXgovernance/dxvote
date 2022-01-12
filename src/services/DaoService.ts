import { action, makeObservable } from 'mobx';
import contentHash from 'content-hash';
import PromiEvent from 'promievent';
import RootContext from '../contexts';
import { ContractType } from '../stores/Provider';
import {
  BigNumber,
  hashVote,
  MAX_UINT,
  toEthSignedMessageHash,
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
    } else if (schemeType === 'SchemeRegistrar') {
      // function proposeScheme(
      //     Avatar _avatar,
      //     address _scheme,
      //     bytes32 _parametersHash,
      //     bytes4 _permissions,
      //     string memory _descriptionHash
      // )
      if (proposalData.register) {
        return providerStore.sendRawTransaction(
          providerStore.getActiveWeb3React(),
          scheme,
          library.eth.abi.encodeFunctionCall(
            {
              name: 'proposeScheme',
              type: 'function',
              inputs: [
                { type: 'address', name: '_avatar' },
                { type: 'address', name: '_scheme' },
                { type: 'bytes32', name: '_parametersHash' },
                { type: 'bytes4', name: '_permissions' },
                { type: 'string', name: '_descriptionHash' },
              ],
            },
            [
              networkContracts.avatar,
              proposalData.schemeAddress,
              proposalData.parametersHash,
              proposalData.permissions,
              contentHash.decode(proposalData.descriptionHash),
            ]
          ),
          '0'
        );
        // function proposeToRemoveScheme(
        //   Avatar _avatar, address _scheme, string memory _descriptionHash
        // )
      } else {
        return providerStore.sendRawTransaction(
          providerStore.getActiveWeb3React(),
          scheme,
          library.eth.abi.encodeFunctionCall(
            {
              name: 'proposeToRemoveScheme',
              type: 'function',
              inputs: [
                { type: 'address', name: '_avatar' },
                { type: 'address', name: '_scheme' },
                { type: 'string', name: '_descriptionHash' },
              ],
            },
            [
              networkContracts.avatar,
              proposalData.schemeAddress,
              contentHash.decode(proposalData.descriptionHash),
            ]
          ),
          '0'
        );
      }
    } else {
      return providerStore.sendTransaction(
        providerStore.getActiveWeb3React(),
        ContractType.WalletScheme1_0,
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

  async signVote(
    votingMachineAddress: string,
    proposalId: string,
    decision: string,
    repAmount: string,
    addSignatureDomain: boolean = true
  ): Promise<string> {
    const { account } = this.context.providerStore.getActiveWeb3React();

    // Step 1: The Vote is hashed, and the hash is signed.
    // keccak256(abi.encodePacked( votingMachine, proposalId, voter, voteDecision, amount ));
    const hashedVote = hashVote(
      votingMachineAddress,
      proposalId,
      account,
      decision,
      repAmount
    );
    console.log('Hashed vote:', hashedVote);

    const voteSignature = await this.context.providerStore.sign(
      this.context.providerStore.getActiveWeb3React(),
      addSignatureDomain ? toEthSignedMessageHash(hashedVote) : hashedVote
    );

    return voteSignature.result;
  }

  executeSignedVote(
    votingMachineAddress: string,
    proposalId: string,
    voter: string,
    decision: string,
    amount: string,
    signature: string
  ): PromiEvent<any> {
    const { providerStore } = this.context;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.DXDVotingMachine,
      votingMachineAddress,
      'executeSignedVote',
      [votingMachineAddress, proposalId, voter, decision, amount, signature],
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
