import { fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExecuteButton from '.';
import { render } from 'utils/tests';

let mockedIsExecutable = true;

jest.mock('hooks/Guilds/ether-swr/guild/useProposalState', () => ({
  __esModule: true,
  default: () => ({
    data: {
      isExecuteable: mockedIsExecutable,
      executeProposal: jest.fn(),
    },
    loading: false,
    error: null,
  }),
}));

describe.skip('useProposalState', () => {
  beforeAll(() => {
    render(<ExecuteButton />);
  });
  describe('Button appearance', () => {
    it('does Button appear', async () => {
      const button = screen.queryByText('Execute');
      expect(button).toBeInTheDocument();
    });
    it('button does not appear when isExecutable is false', async () => {
      mockedIsExecutable = false;
      const button = screen.queryByText('Execute');
      expect(button).toBeNull();
    });
    describe('Execute function', () => {
      it('User is able to click button to execute', async () => {
        mockedIsExecutable = true;
        const button = screen.queryByText('Execute');
        fireEvent.click(button);
      });
    });
  });
});
