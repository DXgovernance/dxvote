import styled, { css } from 'styled-components';
import { animated } from 'react-spring';

import { DialogContent, DialogOverlay } from '@reach/dialog';
import { isMobile } from 'react-device-detect';
import '@reach/dialog/styles.css';
// import { useGesture } from 'react-use-gesture';

const AnimatedDialogOverlay = animated(DialogOverlay);
const WrappedDialogOverlay = ({
    suppressClassNameWarning,
    mobile,
    ...rest
}) => <AnimatedDialogOverlay {...rest} />;
const StyledDialogOverlay = styled(WrappedDialogOverlay).attrs({
    suppressClassNameWarning: true,
})`
    &[data-reach-dialog-overlay] {
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;

        ${({ mobile }) =>
            mobile &&
            css`
                align-items: flex-end;
            `}

        &::after {
            content: '';
            background-color: ${({ theme }) => theme.modalBackground};
            opacity: 0.5;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            /* position: absolute; */
            position: fixed;
            z-index: -1;
        }
    }
`;

const FilteredDialogContent = ({
    minHeight,
    maxHeight,
    isOpen,
    slideInAnimation,
    mobile,
    ...rest
}) => <DialogContent aria-label="BCDappModal" {...rest} />;
const StyledDialogContent = styled(FilteredDialogContent)`
    &[data-reach-dialog-content] {
        border: 1px solid var(--panel-border);
        background-color: var(--panel-border);
        padding: 0px;
        width: 50vw;
        max-width: 650px;
        ${({ maxHeight }) =>
            maxHeight &&
            css`
                max-height: ${maxHeight}vh;
            `}
        ${({ minHeight }) =>
            minHeight &&
            css`
                min-height: ${minHeight}vh;
            `}
    display: flex;
        overflow: hidden;
        border-radius: 10px;
        ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 65vw;
      max-height: 65vh;
      margin: 0;
    `}
        ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
      width:  85vw;
      max-height: 66vh;
      ${
          mobile &&
          css`
              width: 100vw;
              border-radius: 20px;
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
          `
      }
    `}
    }
`;

const HiddenCloseButton = styled.button`
    margin: 0;
    padding: 0;
    width: 0;
    height: 0;
    border: none;
`;

export default function Modal({
    isOpen,
    onDismiss,
    minHeight = false,
    maxHeight = 50,
    children,
}) {
  if (isOpen)
    return (
      <StyledDialogOverlay
        onDismiss={onDismiss}
        mobile={isMobile}
      >
        <StyledDialogContent
          hidden={true}
          minHeight={minHeight}
          maxHeight={maxHeight}
          isOpen={isOpen}
          mobile={isMobile}
        >
          <HiddenCloseButton onClick={onDismiss} />
          {children}
          </StyledDialogContent>
      </StyledDialogOverlay>
    )
  else
    return <div/>
}
