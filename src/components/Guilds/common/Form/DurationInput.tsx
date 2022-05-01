import styled from 'styled-components';
import React, { useState, useMemo } from 'react';
import { Modal } from '../Modal';
import { Flex } from '../Layout/Box';
import { Button } from '../Button';
import moment, { Duration, DurationInputArg2 } from 'moment';

const Column = styled(Flex)`
  flex-direction: column;
`;
const Container = styled(Flex)`
  flex-direction: row;
`;

interface DurationInputProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const DURATION_LIMITS = {
  years: {
    min: 0,
    max: 10,
  },
  months: {
    min: 0,
    max: 11,
  },
  days: {
    min: 0,
    max: 31,
  },
  hours: {
    min: 0,
    max: 23,
  },
  minutes: {
    min: 0,
    max: 59,
  },
  seconds: {
    min: 0,
    max: 59,
  },
};

const DurationInput: React.FC<DurationInputProps> = ({ isOpen, onDismiss }) => {
  const [duration, setDuration] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const increment = (key: string) =>
    setDuration({ ...duration, [key]: duration[key] + 1 });
  const decrement = (key: string) =>
    setDuration({ ...duration, [key]: duration[key] - 1 });

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

  console.log('Time: ' + time.asSeconds());

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <Container>
        {Object.keys(duration).map(value => {
          const count = duration[value];
          return (
            <Column>
              <Button
                disabled={count >= DURATION_LIMITS[value].max}
                onClick={() => increment(value)}
              />
              <div>{count}</div>
              <Button
                disabled={count <= DURATION_LIMITS[value].min}
                onClick={() => decrement(value)}
              />
            </Column>
          );
        })}
      </Container>
    </Modal>
  );
};

export default DurationInput;
