import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../utils/tests';

import { default as ProposalStatus } from './';

jest.mock('hooks/Guilds/ether-swr/useProposal', () => ({
  useProposal: (guild_id, proposal_id) => ({
    data: {
      title: 'Proposal Title',
      description: 'Proposal Description',
      contentHash: '0x0',
      endTime: { toNumber: () => 1642768798 },
    },
    isValidating: false,
  }),
}));

test('renders Ended Proposal Status', async () => {
  render(<ProposalStatus />);
  expect(screen.queryAllByText('Ended')).toBeTruthy();
  expect(screen.queryAllByText('Active')).toHaveLength(0);
});

jest.mock('hooks/Guilds/ether-swr/useProposal', () => ({
  useProposal: () => ({
    data: {},
    isValidating: true,
  }),
}));

test('renders Sleleton loading component', async () => {
  render(<ProposalStatus />);
  expect(screen.queryAllByTestId('skeleton')).toBeTruthy();
});
