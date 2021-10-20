import React from 'react';
import styled from 'styled-components';

import { Button } from 'components/common/Button';

export const ColumnWrapper = styled.div`
  z-index: 100;
  width: 60%;
  outline: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  align-self: center;
`;

export const Wrapper = styled.div`
  width: ${props => `${props.size + 4}%`};
  outline: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const LineWrapper = styled.div`
  width: 100%;
  outline: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 10px auto;
`;

export const Dot = styled.div`
  min-width: 30px;
  min-height: 30px;
  border-radius: 50%;
  background: ${props => (props.active ? '#536DFE' : `#DDDDE3`)};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 8px;
  cursor: pointer;
`;

export const Line = styled.div`
  width: 100%;
  background: ${props =>
    props.active
      ? 'linear-gradient(90deg, #536DFE 60%, #dddde3 100%);'
      : props.complete
      ? '#536DFE'
      : `#DDDDE3`};
  height: 2px;
`;

export const StyledButton = styled(Button)`
  width: ${props => props.buttonSize};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  height: 40px;
`;

interface LevelSelectProps {
  numberOfLevels: number;
  selected: number;
  onSelect?: (index: number) => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  numberOfLevels,
  selected,
  onSelect,
}) => {
  const optionsArray = [];

  const buildLevels = () => {
    // @ts-ignore
    new Array(numberOfLevels).fill(0).forEach((x, index) => {
      optionsArray.push(
        <Dot
          active={selected === index}
          value={index}
          onClick={() => {
            onSelect(index);
          }}
        >
          {index + 1}
        </Dot>
      );
      if (numberOfLevels - 1 > index) {
        optionsArray.push(<Line />);
      }
    });
  };

  buildLevels();

  return <LineWrapper size={100}>{optionsArray}</LineWrapper>;
};
