import styled from 'styled-components';
import ReactDOM from 'react-dom';

import { Button } from '../Button';
import { FiX } from 'react-icons/fi';
import { Heading } from '../Typography';

export const Wrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 700;
  width: 40%;
  min-width: 400px;
  max-width: ${({ maxWidth }) => maxWidth}px;
  outline: 0;

  @media only screen and (max-width: 768px) {
    max-width: 300px;
    min-width: 300px;
    width: 300px;
  }
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
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  margin: auto;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.25);
`;
export const Header = styled.div`
  display: flex;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
  position: relative;
`;

export const HeaderText = styled(Heading)`
  flex: 1;
  line-height: 0;
`;

const CloseIcon = styled(FiX)`
  position: absolute;
  color: ${({ theme }) => theme.colors.text};
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  height: 1.5rem;
  width: 1.5rem;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

export const Content = styled.div`
  color: ${({ theme }) => theme.colors.text};
  max-height: 80vh;
  overflow-x: hidden;
  overflow-y: auto;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 0 1.5rem 1.5rem 1.5rem;
`;

export interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  header: JSX.Element | string;
  hideHeader?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children: JSX.Element;
  maxWidth?: number;
}

export const ModalButton = styled(Button)`
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
  maxWidth,
}) => {
  const modal = (
    <div>
      <Backdrop onClick={onDismiss} />
      <Wrapper maxWidth={maxWidth}>
        <StyledModal>
          {!hideHeader && (
            <Header>
              <HeaderText>{header}</HeaderText>
              <CloseIcon onClick={onDismiss} />
            </Header>
          )}
          <Content>{children}</Content>
          {(onCancel || onConfirm) && (
            <Footer>
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
              {onConfirm && (
                <ModalButton onClick={onConfirm}>{confirmText}</ModalButton>
              )}
            </Footer>
          )}
        </StyledModal>
      </Wrapper>
    </div>
  );

  return isOpen ? ReactDOM.createPortal(modal, document.body) : null;
};
