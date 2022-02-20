import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { default as ProposalCard } from './';

import { render } from '../../../utils/tests';

const proposalTitle = 'Proposal Title';
const creatorAddress = '0x0000000000000000000000000000000000000000';

jest.mock('hooks/Guilds/ether-swr/guild/useProposal', () => ({
  useProposal: () => ({
    data: {
      title: proposalTitle,
      contentHash: '0x0',
      creator: creatorAddress,
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

jest.mock('hooks/Guilds/ens/useENSAvatar', () => ({
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

  //fix
  //expect(screen.queryByTestId('proposal-status')).toBeTruthy();

  //Hardcoded data, not yet passed in component from SWR
  expect(screen.queryByText('test.eth')).toBeTruthy();
  expect(screen.queryByText('150 ETH')).toBeTruthy();
});

test('ProposalCard without data', async () => {
  render(<ProposalCard id={null} href={null} />);

  //Skeleton is rendered
  expect(screen.queryAllByTestId('skeleton')).toBeTruthy();
});
