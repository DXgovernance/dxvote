import styled from 'styled-components';
import { GoTriangleUp, GoTriangleDown } from 'react-icons/go';
import React, { useState, useMemo } from 'react';
import { Modal } from '../Modal';
import { Flex } from '../Layout/Box';
import { Button } from '../Button';
import moment, { Duration, DurationInputArg2 } from 'moment';
import NumericalInput from './NumericalInput';

const Column = styled(Flex)`
  flex-direction: column;
  width: 100px;
  margin: 20px 10px;
`;

const Container = styled(Flex)`
  flex-direction: row;
  justify-content: centre;
`;

const ColumnButton = styled(Button).attrs({
  variant: 'primary',
})`
  background-color: transparent;
  margin: 0;
  border: none;
  :hover:enabled {
    border-color: none;
  }
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
  // TODO: refactor component
  // TODO: integrate component into formRender
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
    if (e > DURATION_LIMITS[value].max || e < DURATION_LIMITS[value].min)
      return;
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

  console.log('Time: ' + time.asSeconds());

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <Container>
        {Object.keys(duration).map(value => {
          const count = duration[value];
          return (
            <Column>
              <ColumnButton
                disabled={count >= DURATION_LIMITS[value].max}
                onClick={() => increment(value)}
              >
                <GoTriangleUp />
              </ColumnButton>
              <NumericalInput
                value={count}
                onChange={e => handleChange(e, value)}
                placeholder={value}
                textAlign='center'
              />
              <ColumnButton
                disabled={count <= DURATION_LIMITS[value].min}
                onClick={() => decrement(value)}
              >
                <GoTriangleDown />
              </ColumnButton>
            </Column>
          );
        })}
      </Container>
    </Modal>
  );
};

export default DurationInput;
