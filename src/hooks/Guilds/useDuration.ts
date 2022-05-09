import moment, { Duration, DurationInputArg2 } from 'moment';
import { useMemo, useState } from 'react';

export const useDuration = () => {
  const [duration, setDuration] = useState({
    years: null,
    months: null,
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
  });

  const increment = (key: string) =>
    setDuration({ ...duration, [key]: duration[key] + 1 });
  const decrement = (key: string) =>
    setDuration({ ...duration, [key]: duration[key] - 1 });

  const handleChange = (e: string, value: string) => {
    if (!parseInt(e)) return;
    return setDuration({ ...duration, [value]: e });
  };

  const { time } = useMemo(() => {
    const convertDurationToSeconds = Object.keys(duration).reduce(
      (acc, curr) => {
        const result = acc.add(
          moment.duration(duration[curr], curr as DurationInputArg2)
        );
        return result;
      },
      moment.duration(0, 'years') as Duration
    );
    return {
      time: convertDurationToSeconds,
    };
  }, [duration]);

  return {
    data: {
      duration,
      setDuration,
      time,
      handleChange,
      increment,
      decrement,
    },
  };
};
