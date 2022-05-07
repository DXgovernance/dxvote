import styled from 'styled-components';
import { GoTriangleUp, GoTriangleDown } from 'react-icons/go';
import React from 'react';
import { DURATION_LIMITS } from 'constants/Duration';
import { useDuration } from 'hooks/Guilds/useDuration';
import { Flex } from '../../Layout';
import { Button } from '../../Button';
import { Modal } from '../../Modal';
import NumericalInput from '../NumericalInput';
import WarningInput from './WarningInput';

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

const WarningRow = styled(Flex)``;

interface DurationInputProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const DurationInput: React.FC<DurationInputProps> = ({ isOpen, onDismiss }) => {
  const {
    data: { duration, handleChange, increment, decrement },
  } = useDuration();

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <>
        <Container>
          {Object.keys(duration).map((value, index) => {
            const count = duration[value];
            return (
              <Column>
                <ColumnButton
                  disabled={count >= DURATION_LIMITS[value].max}
                  onClick={() => increment(value)}
                  key={index}
                >
                  <GoTriangleUp />
                </ColumnButton>
                <NumericalInput
                  value={count}
                  onChange={e => handleChange(e, value)}
                  placeholder={value}
                  textAlign="center"
                  data-testid={value}
                  id={value}
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
        <WarningRow>
          {Object.keys(duration).map(value => {
            return (
              <WarningInput
                timeColumn={value}
                value={duration[value]}
                limit={DURATION_LIMITS[value]}
              />
            );
          })}
        </WarningRow>
      </>
    </Modal>
  );
};

export default DurationInput;
