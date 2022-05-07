import { cleanup, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/tests';
import DurationInput from '.';

describe.only('DurationInput', () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    render(<DurationInput isOpen={true} onDismiss={jest.fn()} />);
  });
  afterEach(() => {
    cleanup();
  });

  describe('renders', () => {
    it('renders all inputs', () => {
      expect(screen.getByTestId('years')).toBeInTheDocument();
      expect(screen.getByTestId('months')).toBeInTheDocument();
      expect(screen.getByTestId('days')).toBeInTheDocument();
      expect(screen.getByTestId('hours')).toBeInTheDocument();
      expect(screen.getByTestId('minutes')).toBeInTheDocument();
      expect(screen.getByTestId('seconds')).toBeInTheDocument();
    });
  });
  describe('check inputs', () => {
    it('years accepts inputs', async () => {
      const input = screen.getByTestId('years');
      await user.tripleClick(input);
      await user.keyboard('9');
      expect(input).toHaveValue('9');
    });
    it('months accepts inputs', async () => {
      const input = screen.getByTestId('minutes');
      await user.tripleClick(input);
      await user.keyboard('10');
      expect(input).toHaveValue('10');
    });
    it('days accepts inputs', async () => {
      const input = screen.getByTestId('days');
      await user.tripleClick(input);
      await user.keyboard('28');
      expect(input).toHaveValue('28');
    });
    it('hours accepts inputs', async () => {
      const input = screen.getByTestId('hours');
      await user.tripleClick(input);
      await user.keyboard('23');
      expect(input).toHaveValue('23');
    });
    it('minutes accepts inputs', async () => {
      const input = screen.getByTestId('minutes');
      await user.tripleClick(input);
      await user.keyboard('50');
      expect(input).toHaveValue('50');
    });
    it('seconds accepts inputs', async () => {
      const input = screen.getByTestId('seconds');
      await user.tripleClick(input);
      await user.keyboard('50');
      expect(input).toHaveValue('50');
    });
    describe('checks max limits', () => {
      it('years input does not go over max limit', async () => {
        const input = screen.getByTestId('years');
        await user.tripleClick(input);
        await user.keyboard('99');
        expect(input).toHaveValue('99');
      });
      it('months accepts inputs', async () => {
        const input = screen.getByTestId('minutes');
        await user.tripleClick(input);
        await user.keyboard('10');
        expect(input).toHaveValue('10');
      });
      it('days accepts inputs', async () => {
        const input = screen.getByTestId('days');
        await user.tripleClick(input);
        await user.keyboard('28');
        expect(input).toHaveValue('28');
      });
      it('hours accepts inputs', async () => {
        const input = screen.getByTestId('hours');
        await user.tripleClick(input);
        await user.keyboard('23');
        expect(input).toHaveValue('23');
      });
      it('minutes accepts inputs', async () => {
        const input = screen.getByTestId('minutes');
        await user.tripleClick(input);
        await user.keyboard('50');
        expect(input).toHaveValue('50');
      });
      it('seconds accepts inputs', async () => {
        const input = screen.getByTestId('seconds');
        await user.tripleClick(input);
        await user.keyboard('50');
        expect(input).toHaveValue('50');
      });
    });
    it('cannot go under min limits', () => {}),
      it('calculates total seconds', () => {});
  });
});
