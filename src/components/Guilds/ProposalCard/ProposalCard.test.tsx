import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { default as ProposalCard } from './';

import { render } from '../../../utils/tests';

jest.mock('hooks/Guilds/useProposal', () => ({
  useProposal: () => ({
    data: {
      title: 'Proposal Title',
      description: 'Proposal Description',
      contentHash: '0x0',
      endTime: { toNumber: () => 3 },
    },
    isValidating: false,
  }),
}));

test('ProposalCard with mocked data', async () => {
  render(<ProposalCard id="" href="" />);

  //Title is rendered
  expect(screen.queryByText('Proposal Title')).toBeTruthy();

  //description is not rendered in ProposalCard
  expect(screen.queryByText('Proposal Description')).toBeNull();

  //fix
  //expect(screen.queryByTestId('proposal-status')).toBeTruthy();

  //Hardcoded data, not yet passed in component from SWR
  expect(screen.queryByText('Swapr von 0x01Cf...2712')).toBeTruthy();
  expect(screen.queryByText('150 ETH')).toBeTruthy();
});
