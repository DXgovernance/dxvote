import { default as ProposalCard } from '.';
import { render } from '../../../utils/tests';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { BigNumber } from 'ethers';

const proposalTitle = 'Proposal Title';
const creatorAddress = '0x0000000000000000000000000000000000000000';
const mockVotes = [BigNumber.from(20), BigNumber.from(40)];
const mockTotalVotes = BigNumber.from(100);

jest.mock('hooks/Guilds/ether-swr/guild/useProposal', () => ({
  useProposal: () => ({
    data: {
      title: proposalTitle,
      contentHash: '0x0',
      creator: creatorAddress,
      totalVotes: mockVotes,
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

jest.mock('hooks/Guilds/ether-swr/guild/useGuildConfig', () => ({
  useGuildConfig: () => ({
    data: {
      totalLocked: mockTotalVotes,
    },
    isValidating: false,
  }),
}));

jest.mock('hooks/Guilds/ether-swr/ens/useENSAvatar', () => ({
  __esModule: true,
  default: () => ({
    avatarUri: 'test',
    imageUrl: 'test',
    ensName: 'test.eth',
  }),
}));

test('ProposalCard with mocked data', async () => {
  render(<ProposalCard id="test" href="test" />);

  //Title is rendered
  expect(screen.queryByText(proposalTitle)).toBeTruthy();

  // Votes rendered
  expect(screen.queryByText('20%')).toBeTruthy();
  expect(screen.queryByText('40%')).toBeTruthy();

  //fix
  //expect(screen.queryByTestId('proposal-status')).toBeTruthy();

  //Hardcoded data, not yet passed in component from SWR
  expect(screen.queryByText('test.eth')).toBeTruthy();
  // expect(screen.queryByText('150 ETH')).toBeTruthy();
});

test('ProposalCard without data', async () => {
  render(<ProposalCard id={null} href={null} />);

  //Skeleton is rendered
  expect(screen.queryAllByTestId('skeleton')).toBeTruthy();
});
