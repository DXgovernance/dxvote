import { useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  encodeDxdVestingCreate,
  encodeErc20Approval,
  encodeErc20Transfer,
  encodeRepMint,
  normalizeBalance,
  TXEvents,
} from 'utils';
import { useContext } from 'contexts';
const contentHash = require('content-hash');

interface UsePaymentAmountsReturns {
  submitProposal: () => Promise<any>;
  loading: boolean;
  proposalCreated: boolean;
  errorMessage: string;
}

export const useSubmitProposal = (
  stableAmount: BigNumber,
  dxdAmount: BigNumber,
  repReward: BigNumber,
  dxdPrice: number,
  startDate: moment.Moment,
  setConfirm: any,
  selectedLevel: any
): UsePaymentAmountsReturns => {
  const {
    context: {
      ipfsService,
      pinataService,
      providerStore,
      configStore,
      daoStore,
      daoService,
    },
  } = useContext();

  const { library, account } = providerStore.getActiveWeb3React();

  const contracts = configStore.getNetworkContracts();
  const tokens = configStore.getTokensOfNetwork();

  const [loading, setLoading] = useState(null);
  const [proposalCreated, setProposalCreated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const proposalType = configStore
    .getProposalTypes()
    .find(type => type.id === 'contributor');

  const scheme = daoStore
    .getAllSchemes()
    .find(scheme => scheme.name === proposalType.scheme);

  const submitProposal = async () => {
    try {
      setLoading(true);

      const hash = await ipfsService.uploadProposalMetadata(
        localStorage.getItem('dxvote-newProposal-title'),
        localStorage.getItem('dxvote-newProposal-description') +
          `${
            '\n$' + normalizeBalance(stableAmount).toString()
          } \n ${normalizeBalance(
            dxdAmount
          ).toString()} DXD vested for 3 years and 1 year cliff @ $${dxdPrice}/DXD
          \n ${normalizeBalance(repReward).toString()} REP \n `,
        ['Contributor Proposal', `Level ${selectedLevel.id}`],
        pinataService
      );

      // Encode rep mint call
      const repCallData = encodeRepMint(
        library,
        repReward.toString(),
        account,
        contracts.avatar
      );

      // Encode WXDAI transfer
      const wxdaiTransferCallData = encodeErc20Transfer(
        library,
        account,
        stableAmount.toString()
      );

      // Encode DXD approval
      const dxdApprovalCallData = encodeErc20Approval(
        library,
        contracts.utils.dxdVestingFactory,
        dxdAmount.toString()
      );

      // Encode vesting contract call
      const vestingCallData = encodeDxdVestingCreate(
        library,
        account,
        dxdAmount.toString(),
        startDate
      );

      const proposalData = {
        to: [
          contracts.controller,
          // Needs new stables coin value in config for other networks
          tokens.find(token => token.symbol === 'WXDAI').address,
          tokens.find(token => token.symbol === 'DXD').address,
          contracts.utils.dxdVestingFactory,
        ],
        data: [
          repCallData,
          wxdaiTransferCallData,
          dxdApprovalCallData,
          vestingCallData,
        ],

        value: [0, 0, 0, 0],
        titleText: localStorage.getItem('dxvote-newProposal-title'),
        descriptionHash: contentHash.fromIpfs(hash),
      };

      console.debug('[PROPOSAL]', scheme.address, proposalData);

      daoService
        .createProposal(scheme.address, scheme.type, proposalData)
        .on(TXEvents.TX_HASH, hash => {
          console.debug('[TX_SUBMITTED]', hash);
          setConfirm(false);
        })
        .on(TXEvents.RECEIPT, hash => {
          console.debug('[TX_RECEIPT]', hash);
          setLoading(false);
          setProposalCreated(true);
        })
        .on(TXEvents.TX_ERROR, txerror => {
          console.error('[TX_ERROR]', txerror);
          setLoading(false);
          setErrorMessage((txerror as Error).message);
        })
        .on(TXEvents.INVARIANT, error => {
          console.error('[ERROR]', error);
          setLoading(false);
          setErrorMessage((error as Error).message);
        })
        .catch(error => {
          console.error('[ERROR]', error);
          setLoading(false);
          setErrorMessage((error as Error).message);
        });
    } catch (error) {
      console.error('[PROPOSAL_ERROR]', error);
    }
  };

  return {
    submitProposal,
    loading,
    proposalCreated,
    errorMessage,
  };
};
