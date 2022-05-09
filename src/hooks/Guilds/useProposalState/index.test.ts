import { renderHook } from '@testing-library/react-hooks';
import useProposalState from '.';

let mockedIsBefore = true;
let mockedData = {
  id: '0x0',
  creator: '0x0',
  startTime: {
    toNumber: () => 3,
    isBefore: () => false,
    fromNow: () => 'now',
    toNow: () => 'later',
    format: () => 'A Date Formate',
  },
  to: ['0x0', '0x0'],
  data: ['0x0', '0x0'],
  state: 'Active',
  title: 'Proposal Title',
  description: 'Proposal Description',
  contentHash: '0x0',
  endTime: {
    toNumber: () => 3,
    isBefore: () => mockedIsBefore,
    fromNow: () => 'now',
    toNow: () => 'later',
    format: () => 'A Date Formate',
  },
};

jest.mock('react-router-dom', () => ({
  _esModule: true,
  useParams: () => ({
    guildId: 'guild_id',
    proposalId: 'proposal_id',
  }),
  useRouteMatch: () => ({ url: '/guild_id/proposal_id/' }),
}));

jest.mock('hooks/Guilds/ether-swr/guild/useProposal', () => ({
  useProposal: () => ({
    data: mockedData,
    isValidating: false,
  }),
}));

jest.mock('contexts/Guilds/transactions', () => ({
  useTransactions: () => ({
    transactions: {
      hash: '0x0',
      from: '0x0',
      addedTime: 0,
    },
    pendingTransaction: {
      summary: 'filler transaction',
      transactionHash: '0x0',
      cancelled: false,
      showModal: true,
    },
    createTransaction: jest.fn(() => true),
    clearAllTransactions: jest.fn(),
  }),
}));

jest.mock('hooks/Guilds/contracts/useContract', () => ({
  useERC20Guild: () => ({
    contractId: '0x0',
    abi: 'anything',
    provider: jest.fn(),
    account: '0x0',
    chainId: 0,
    walletChainId: 0,
    withSignerIfPossible: false,
  }),
}));

describe('useProposalState', () => {
  it('isExecutable is true when proposal is ready to be executed', async () => {
    //isBefore is set to true in proposal mock
    const { result } = renderHook(() => useProposalState());
    expect(result.current.loading).toBeFalsy();
    expect(result.current.data.isExecutable).toBeTruthy();
  });
  it('executeProposal is able to be fired', async () => {
    const { result } = renderHook(() => useProposalState());
    expect(result.current.data.executeProposal).toBeTruthy();
  });
  it('if Proposal status is not active isExecutable is false', async () => {
    mockedIsBefore = false;
    const { result } = renderHook(() => useProposalState());
    expect(result.current.data.isExecutable).toBeFalsy();
  });
  it('if Proposal does not exist then isExecutable is false', async () => {
    mockedData = undefined;
    const { result } = renderHook(() => useProposalState());
    expect(result.current.data.isExecutable).toBeFalsy();
    expect(result.current.data.executeProposal).toBeNull();
  });
});
