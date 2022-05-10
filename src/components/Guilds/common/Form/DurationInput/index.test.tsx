import { cleanup, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/tests';
import DurationInput from '.';
import { useDuration } from 'hooks/Guilds/useDuration';

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
  describe('Cannot click past upper DURATION Limits', async () => {
    it('Cannot Click past upper year limit', async () => {
      const input = screen.getByTestId('years');
      const button = screen.getByTestId('upper-limit-btn-years');
      await user.tripleClick(input);
      await user.keyboard('9');
      await user.click(button);
      expect(input).toHaveValue('10');
    });
    it('Cannot Click past upper months limit', async () => {
      const input = screen.getByTestId('months');
      const button = screen.getByTestId('upper-limit-btn-months');
      await user.tripleClick(input);
      await user.keyboard('10');
      await user.click(button);
      expect(input).toHaveValue('11');
    });
    it('Cannot Click past upper days limit', async () => {
      const input = screen.getByTestId('days');
      const button = screen.getByTestId('upper-limit-btn-days');
      await user.tripleClick(input);
      await user.keyboard('30');
      await user.click(button);
      expect(input).toHaveValue('31');
    });
    it('Cannot Click past upper hours limit', async () => {
      const input = screen.getByTestId('hours');
      const button = screen.getByTestId('upper-limit-btn-hours');
      await user.tripleClick(input);
      await user.keyboard('22');
      await user.click(button);
      expect(input).toHaveValue('23');
    });
    it('Cannot Click past upper minutes limit', async () => {
      const input = screen.getByTestId('minutes');
      const button = screen.getByTestId('upper-limit-btn-minutes');
      await user.tripleClick(input);
      await user.keyboard('58');
      await user.click(button);
      expect(input).toHaveValue('59');
    });
    it('Cannot Click past upper seconds limit', async () => {
      const input = screen.getByTestId('seconds');
      const button = screen.getByTestId('upper-limit-btn-seconds');
      await user.tripleClick(input);
      await user.keyboard('58');
      await user.click(button);
      expect(input).toHaveValue('59');
    });
  });
  describe('cannot click past lower DURATION Limits', async () => {
    it('Cannot Click past lower year limit', async () => {
      const input = screen.getByTestId('years');
      const button = screen.getByTestId('lower-limit-btn-years');
      await user.tripleClick(input);
      await user.keyboard('0');
      await user.click(button);
      expect(input).toHaveValue('0');
    });
    it('Cannot Click past lower months limit', async () => {
      const input = screen.getByTestId('months');
      const button = screen.getByTestId('lower-limit-btn-months');
      await user.tripleClick(input);
      await user.keyboard('0');
      await user.click(button);
      expect(input).toHaveValue('0');
    });
    it('Cannot Click past lower days limit', async () => {
      const input = screen.getByTestId('days');
      const button = screen.getByTestId('lower-limit-btn-days');
      await user.tripleClick(input);
      await user.keyboard('0');
      await user.click(button);
      expect(input).toHaveValue('0');
    });
    it('Cannot Click past lower hours limit', async () => {
      const input = screen.getByTestId('hours');
      const button = screen.getByTestId('lower-limit-btn-hours');
      await user.tripleClick(input);
      await user.keyboard('0');
      await user.click(button);
      expect(input).toHaveValue('0');
    });
    it('Cannot Click past lower minutes limit', async () => {
      const input = screen.getByTestId('minutes');
      const button = screen.getByTestId('lower-limit-btn-minutes');
      await user.tripleClick(input);
      await user.keyboard('0');
      await user.click(button);
      expect(input).toHaveValue('0');
    });
    it('Cannot Click past lower seconds limit', async () => {
      const input = screen.getByTestId('seconds');
      const button = screen.getByTestId('lower-limit-btn-seconds');
      await user.tripleClick(input);
      await user.keyboard('0');
      await user.click(button);
      expect(input).toHaveValue('0');
    });
  });
  describe('check convert duration to seconds', async () => {
    it('can convert one year, one months, one day, one hour, one minute and one second into seconds', async () => {
      const { result } = renderHook(() => useDuration());

      act(() => {
        result.current.data.increment('years');
      });

      act(() => {
        result.current.data.increment('months');
      });
      act(() => {
        result.current.data.increment('days');
      });
      act(() => {
        result.current.data.increment('hours');
      });
      act(() => {
        result.current.data.increment('minutes');
      });
      act(() => {
        result.current.data.increment('seconds');
      });
      expect(result.current.data.time).toBe(34304461);
    });
  });
});
