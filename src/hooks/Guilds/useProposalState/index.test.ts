import useProposalState from '.';

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
    data: {
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
        isBefore: () => false,
        fromNow: () => 'now',
        toNow: () => 'later',
        format: () => 'A Date Formate',
      },
    },
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
    createTransaction: jest.fn(),
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

jest.mock('react', () => ({
  useMemo: () => ({
    data: {
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
        isBefore: () => false,
        fromNow: () => 'now',
        toNow: () => 'later',
        format: () => 'A Date Formate',
      },
    },
    loading: false,
  }),
}));

describe('useProposalState', () => {
  it.only('isExecutable is true when proposal is ready to be executed', async () => {
    const {
      data: { isExecutable },
    } = useProposalState();
    expect(isExecutable).toBeTruthy();
  });
});
