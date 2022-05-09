import { cleanup, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/tests';
import DurationInput from '.';

describe('DurationInput', () => {
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
    describe('Warning if over limit', () => {
      it('years column shows warning', async () => {
        const input = screen.getByTestId('years');
        await user.tripleClick(input);
        await user.keyboard('99');
        const warning = screen.getByTestId('warning-max');
        await waitFor(() => {
          expect(warning).toBeInTheDocument();
        });
      });
      it('years column shows warning', async () => {
        const input = screen.getByTestId('years');
        await user.tripleClick(input);
        await user.keyboard('99');
        const warning = screen.getByTestId('warning-max');
        await waitFor(() => {
          expect(warning).toBeInTheDocument();
        });
      });
      it('months column shows warning', async () => {
        const input = screen.getByTestId('months');
        await user.tripleClick(input);
        await user.keyboard('13');
        const warning = screen.getByTestId('warning-max');
        await waitFor(() => {
          expect(warning).toBeInTheDocument();
        });
      });
      it('days column shows warning', async () => {
        const input = screen.getByTestId('days');
        await user.tripleClick(input);
        await user.keyboard('32');
        const warning = screen.getByTestId('warning-max');
        await waitFor(() => {
          expect(warning).toBeInTheDocument();
        });
      });
      it('hours column shows warning', async () => {
        const input = screen.getByTestId('hours');
        await user.tripleClick(input);
        await user.keyboard('24');
        const warning = screen.getByTestId('warning-max');
        await waitFor(() => {
          expect(warning).toBeInTheDocument();
        });
      });
      it('minutes column shows warning', async () => {
        const input = screen.getByTestId('minutes');
        await user.tripleClick(input);
        await user.keyboard('60');
        const warning = screen.getByTestId('warning-max');
        await waitFor(() => {
          expect(warning).toBeInTheDocument();
        });
      });
      it('years column shows warning', async () => {
        const input = screen.getByTestId('seconds');
        await user.tripleClick(input);
        await user.keyboard('60');
        const warning = screen.getByTestId('warning-max');
        await waitFor(() => {
          expect(warning).toBeInTheDocument();
        });
      });
    });
  });
});
