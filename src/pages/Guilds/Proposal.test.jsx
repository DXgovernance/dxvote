import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import useEtherSWR from 'ether-swr';
import Proposal from './Proposal';

it('testing Proposal view', () => {
  useEtherSWR.mockReturnValue({
    loading: false,
    data: {
      results: [
        {
          name: 'Luke Skywalker',
        },
        {
          name: 'C-3PO',
        },
        {
          name: 'Darth Vader',
        },
      ],
    },
  });
  const { getAllByText, container } = render(<Proposal id={'a'} />);
});
