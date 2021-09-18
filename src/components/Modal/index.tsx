import styled from 'styled-components';
import ReactDOM from 'react-dom';

import ActiveButton from '../common/ActiveButton';

import { ReactComponent as Close } from '../../assets/images/x.svg';
// import { animated } from 'react-spring';

// import { DialogContent, DialogOverlay } from '@reach/dialog';
// import { isMobile } from 'react-device-detect';
// import { useGesture } from 'react-use-gesture';

export const Wrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 700;
  width: 40%;
  min-width: 400px;
  outline: 0;
`;
export const Backdrop = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 6, 41, 0.5);
  z-index: 500;
`;
export const StyledModal = styled.div`
  z-index: 100;
  background: white;
  position: relative;
  margin: auto;
  border-radius: 10px;
`;
export const Header = styled.div`
  display: flex;
  padding: 24px;
`;
export const HeaderText = styled.div`
  color: #000629;
  flex: 1;
  font-size: 1.1rem;
`;

const CloseIcon = styled.div`
  position: absolute;
  color: var(--header-text);
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.chaliceGray};
  }
`;

export const Content = styled.div`
  color: #7b7f93;
  max-height: 30rem;
  overflow-x: hidden;
  overflow-y: auto;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 16px 16px 16px;
`;

export interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  header: JSX.Element;
  hideHeader?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (any?: any) => void;
  onCancel?: () => void;
  children: JSX.Element;
}

export const ModalButton = styled(ActiveButton)`
  margin: 8px;
  flex: 1;
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onDismiss,
  header,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  hideHeader,
  children,
}) => {
  const modal = (
    <div>
      <Backdrop onClick={onDismiss} />
      <Wrapper>
        <StyledModal>
          {!hideHeader && (
            <Header>
              <HeaderText>{header}</HeaderText>
              <CloseIcon onClick={onDismiss}>
                <CloseColor />
              </CloseIcon>
            </Header>
          )}
          <Content>{children}</Content>
          <Footer>
            {onConfirm && (
              <ModalButton onClick={onConfirm}>{confirmText}</ModalButton>
            )}
            {onCancel && (
              <ModalButton
                variant="secondary"
                onClick={() => {
                  onCancel();
                  onDismiss();
                }}
              >
                {cancelText}
              </ModalButton>
            )}
          </Footer>
        </StyledModal>
      </Wrapper>
    </div>
  );

  return isOpen ? ReactDOM.createPortal(modal, document.body) : null;
};

// const AnimatedDialogOverlay = animated(DialogOverlay);
// const WrappedDialogOverlay = ({
//   suppressClassNameWarning,
//   mobile,
//   ...rest
// }) => <AnimatedDialogOverlay {...rest} />;
// const StyledDialogOverlay = styled(WrappedDialogOverlay).attrs({
//   suppressClassNameWarning: true,
// })`
//   &[data-reach-dialog-overlay] {
//     z-index: 2;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     background-color: transparent;

//     ${({ mobile }) =>
//       mobile &&
//       css`
//         align-items: flex-end;
//       `}

//     &::after {
//       content: '';
//       background-color: ${({ theme }) => theme.modalBackground};
//       opacity: 0.5;
//       top: 0;
//       left: 0;
//       bottom: 0;
//       right: 0;
//       /* position: absolute; */
//       position: fixed;
//       z-index: -1;
//     }
//   }
// `;

// const FilteredDialogContent = ({
//   minHeight,
//   maxHeight,
//   isOpen,
//   slideInAnimation,
//   mobile,
//   ...rest
// }) => <DialogContent aria-label="BCDappModal" {...rest} />;
// const StyledDialogContent = styled(FilteredDialogContent)`
//   &[data-reach-dialog-content] {
//     border: 1px solid var(--panel-border);
//     background-color: var(--panel-border);
//     padding: 0px;
//     width: 50vw;
//     max-width: 650px;
//     ${({ maxHeight }) =>
//       maxHeight &&
//       css`
//         max-height: ${maxHeight}vh;
//       `}
//     ${({ minHeight }) =>
//       minHeight &&
//       css`
//         min-height: ${minHeight}vh;
//       `}
//     display: flex;
//     overflow: hidden;
//     border-radius: 10px;
//     ${({ theme }) => theme.mediaWidth.upToMedium`
//       width: 65vw;
//       max-height: 65vh;
//       margin: 0;
//     `}
//     ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
//       width:  85vw;
//       max-height: 66vh;
//       ${
//         mobile &&
//         css`
//           width: 100vw;
//           border-radius: 20px;
//           border-bottom-left-radius: 0;
//           border-bottom-right-radius: 0;
//         `
//       }
//     `}
//   }
// `;

// const HiddenCloseButton = styled.button`
//   margin: 0;
//   padding: 0;
//   width: 0;
//   height: 0;
//   border: none;
// `;

// export default function Modal({
//   isOpen,
//   onDismiss,
//   minHeight = false,
//   maxHeight = 50,
//   children,
// }) {
//   if (isOpen)
//     return (
//       <StyledDialogOverlay onDismiss={onDismiss} mobile={isMobile}>
//         <StyledDialogContent
//           hidden={true}
//           minHeight={minHeight}
//           maxHeight={maxHeight}
//           isOpen={isOpen}
//           mobile={isMobile}
//         >
//           <HiddenCloseButton onClick={onDismiss} />
//           {children}
//         </StyledDialogContent>
//       </StyledDialogOverlay>
//     );
//   else return <div />;
// }
