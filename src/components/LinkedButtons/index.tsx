// Externals
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Components
import { Button } from 'components/common/Button';
import PendingCircle from 'components/common/PendingCircle';
// import { Spinner } from 'src/components/Spinner'

export const ColumnWrapper = styled.div(() => ({
  zIndex: 100,
  width: '60%',
  outline: '0',
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '16px',
  alignSelf: 'center',
}));

export const Wrapper = styled.div<ProgressLineProps>(props => ({
  width: `${props.size + 4}%`,
  outline: '0',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

interface ProgressLineProps {
  size: number;
}

export const ProgressLineWrapper = styled.div<ProgressLineProps>(props => ({
  width: `${props.size + 4}%`,
  outline: '0',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '10px auto',
}));

interface StatusProps {
  active: boolean;
  complete?: boolean;
}

export const Dot = styled.div<StatusProps>(props => ({
  minWidth: '20px',
  minHeight: '20px',
  borderRadius: '50%',
  background: props.active ? '#4B9E98' : `#DDDDE3`,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: '8px',
  fontSize: '12px',
}));

export const Line = styled.div<StatusProps>(props => ({
  width: '100%',
  background: props.active
    ? 'linear-gradient(90deg, #4b9e98 60%, #dddde3 100%);'
    : props.complete
    ? '#4b9e98'
    : `#DDDDE3`,
  height: '2px',
}));

interface ButtonProps {
  buttonSize: string;
}

export const StyledButton = styled(Button)<ButtonProps>(props => ({
  width: props.buttonSize,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  height: '40px',
}));

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
  disabled?: boolean;
  loading?: boolean;
}

export const LinkedButtons: React.FC<LinkedButtonsProps> = ({
  buttons,
  active,
  disabled = false,
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
          disabled={!(button.id === active) || disabled}
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
