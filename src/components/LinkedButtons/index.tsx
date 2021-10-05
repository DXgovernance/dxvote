// Externals
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Components
import { Button } from 'components/common/Button';
import PendingCircle from 'components/common/PendingCircle';

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

export const ProgressLineWrapper = styled.div`
  width: ${props => `${props.size + 4}%`};
  outline: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 10px auto;
`;

export const Dot = styled.div`
  min-width: 20px;
  min-height: 20px;
  border-radius: 50%;
  background: ${props => (props.active ? '#4B9E98' : `#DDDDE3`)};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 8px;
  font-size: 12px;
`;

export const Line = styled.div`
  width: 100%;
  background: ${props =>
    props.active
      ? 'linear-gradient(90deg, #4b9e98 60%, #dddde3 100%);'
      : props.complete
      ? '#4b9e98'
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

interface ButtonObject {
  title: string;
  id: string | number;
  loadingId?: string | number;
  onClick: () => void;
  typeSubmit?: boolean;
}

interface LinkedButtonsProps {
  buttons: ButtonObject[];
  active: string | number;
}

export const LinkedButtons: React.FC<LinkedButtonsProps> = ({
  buttons,
  active,
}) => {
  const [arrayOfButtons, setArrayOfButtons] = useState<Array<React.ReactNode>>(
    []
  );
  const [progressLineArray, setProgressLineArray] = useState<
    Array<React.ReactNode>
  >([]);
  const numberOfButtons = buttons.length;
  const buttonSize = (100 - numberOfButtons * 2) / numberOfButtons;

  const createButtons = () => {
    const tempButtons: Array<React.ReactNode> = [];
    const tempProgressBar: Array<React.ReactNode> = [];
    let beforeActive = true;

    buttons.forEach((button, index) => {
      if (button.id === active) {
        beforeActive = false;
      }
      tempButtons.push(
        <StyledButton
          buttonSize={`${buttonSize}%`}
          onClick={button.onClick}
          disabled={!(button.id === active)}
          type={button.typeSubmit ? 'submit' : 'button'}
        >
          {button.title}
          {button.loadingId === active && (
            <PendingCircle height="10px" width="10px" />
          )}
        </StyledButton>
      );
      if (numberOfButtons - 1 > index) {
        tempProgressBar.push(
          <Dot
            active={
              button.id === active ||
              button.loadingId === active ||
              beforeActive
            }
          >
            {index + 1}
          </Dot>
        );
        tempProgressBar.push(
          <Line
            active={button.id === active || button.loadingId === active}
            complete={beforeActive}
          />
        );
      } else {
        tempProgressBar.push(
          <Dot active={button.id === active || button.loadingId === active}>
            {numberOfButtons}
          </Dot>
        );
      }
    });

    setArrayOfButtons(tempButtons);
    setProgressLineArray(tempProgressBar);
  };

  useEffect(() => {
    createButtons();
  }, [buttons, active]);

  return (
    <ColumnWrapper>
      <Wrapper>{arrayOfButtons}</Wrapper>
      <ProgressLineWrapper size={100 - buttonSize}>
        {progressLineArray}
      </ProgressLineWrapper>
    </ColumnWrapper>
  );
};
