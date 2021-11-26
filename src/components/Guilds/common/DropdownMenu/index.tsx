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
  display: none;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  padding-top: 0.25rem;
  position: absolute;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 9999;
  width: 12.5rem;
`;

export const DropdownMenu = styled<DropdownProps>(Box)`
  position: relative;

  ${DropdownContent} {
    left: ${props =>
      props.position === DropdownPosition.BottomLeft ? '0' : 'auto'};
    right: ${props =>
      props.position === DropdownPosition.BottomRight ? '0' : 'auto'};
  }

  &:hover ${DropdownContent} {
    display: block;
  }
`;

DropdownMenu.defaultProps = {
  position: DropdownPosition.BottomLeft,
};
