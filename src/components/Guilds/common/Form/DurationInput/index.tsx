import styled from 'styled-components';
import { GoTriangleUp, GoTriangleDown } from 'react-icons/go';
import React from 'react';
import { DURATION_LIMITS } from 'constants/Duration';
import { useDuration } from 'hooks/Guilds/useDuration';
import WarningInput from './WarningInput';
import { Flex } from 'Components/Primitives/Layout';
import { Button } from 'old-components/common/Button';
import { Modal } from 'old-components/Guilds/common/Modal';
import NumericalInput from 'old-components/Guilds/common/Form/NumericalInput';

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
                  data-testid={`upper-limit-btn-${value}`}
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
                  data-testid={`lower-limit-btn-${value}`}
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
