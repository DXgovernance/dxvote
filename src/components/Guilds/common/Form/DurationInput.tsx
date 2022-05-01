import styled from 'styled-components';
import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Flex } from '../Layout/Box';
import { Button } from '../Button';

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

interface CalenderLimits {
  years: number[];
  months: number[];
  days: number[];
  hours: number[];
  minutes: number[];
  seconds: number[];
}

interface QuantityProps {
  constraints: CalenderLimits;
  constraint: string;
}

const useCounter = () => {
  const [counter, setCounter] = useState(0);

  const increment = () => setCounter(prevCount => prevCount + 1);
  const decrement = () => setCounter(prevCount => prevCount - 1);

  return { counter, setCounter, increment, decrement };
};

const Quantity: React.FC<QuantityProps> = ({ constraints, constraint }) => {
  const { counter, increment, decrement } = useCounter();

  return (
    <Column>
      <Button disabled={counter >= constraints[constraint][1]} onClick={increment} />
      <div>{counter}</div>
      <Button disabled={counter <= constraints[constraint][0]} onClick={decrement} />
    </Column>
  );
};

const DurationInput: React.FC<DurationInputProps> = ({ isOpen, onDismiss }) => {
  const constraints = {
    years: [0, 10],
    months: [0, 11],
    days: [0, 29],
    hours: [0, 23],
    minutes: [0, 59],
    seconds: [0, 59],
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <Container>
        {Object.keys(constraints).map(constraint => {
          return <Quantity constraints={constraints} constraint={constraint} />;
        })}
      </Container>
    </Modal>
  );
};

export default DurationInput;
