import styled from 'styled-components';
import { IconButton } from '../Button';
import { Box } from '../Layout';

interface DropdownProps {
  position: DropdownPosition;
}

export enum DropdownPosition {
  BottomLeft = 'left',
  BottomRight = 'right',
}

export const DropdownButton = styled(IconButton)``;

export const DropdownContent = styled(Box)`
  display: ${({ show }) => (show ? 'block' : 'none')};
  border: 1px solid #000;
  border-radius: 0.5rem;
  padding-top: 0.25rem;
  position: absolute;
  background-color: #fff;
  z-index: 9999;
  width: 12.5rem;

  @media only screen and (max-width: 768px) {
    height: 100vh;
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    display: ${({ show }) => (show ? 'block' : 'none')};
    border: none;
  }
`;

export const DropdownMenu = styled<DropdownProps>(Box)`
  position: relative;

  ${DropdownContent} {
    left: ${props =>
      props.position === DropdownPosition.BottomLeft ? '0' : 'auto'};
    right: ${props =>
      props.position === DropdownPosition.BottomRight ? '0' : 'auto'};
  }
`;

DropdownMenu.defaultProps = {
  position: DropdownPosition.BottomLeft,
};
