import styled, { css } from 'styled-components';
import { IconButton } from '../Button';
import { Box } from '../../../../Components/Primitives/Layout';

interface DropdownProps {
  position?: DropdownPosition;
}

export enum DropdownPosition {
  BottomLeft = 'left',
  BottomRight = 'right',
}

export const DropdownButton = styled(IconButton)``;

interface DropdownContentProps {
  show: boolean;
  fullScreenMobile?: boolean;
}

export const DropdownHeader = styled.div`
  padding: 20px 5px;
  align-items: center;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  span {
    margin-left: 5px;
  }
`;

// DropdownContent renders a floating absolute box under the button that opens it.
// In mobile, if fullScreenMobile is true it renders an absolute full screen menu.
export const DropdownContent = styled(Box)<DropdownContentProps>`
  display: ${({ show }) => (show ? 'block' : 'none')};
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  padding-top: 0.25rem;
  position: absolute;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 9999;
  width: 100%;
  min-width: 200px;

  ${({ fullScreenMobile }) =>
    fullScreenMobile &&
    css<{ show?: boolean }>`
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
    `}
`;

export const DropdownMenu = styled(Box)<DropdownProps>`
  position: relative;
  width: 100%;

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
