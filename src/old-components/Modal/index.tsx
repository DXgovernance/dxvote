import styled from 'styled-components';
import ReactDOM from 'react-dom';

import { Button } from '../common';

import { ReactComponent as Close } from '../../assets/images/x.svg';

export const Wrapper = styled.div<{ maxWidth?: number }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 700;
  width: auto;
  max-width: ${({ maxWidth }) => maxWidth}px;
  min-width: 400px;
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
  justify-content: space-around;
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
              <CloseIcon onClick={onDismiss}>
                <CloseColor />
              </CloseIcon>
            </Header>
          )}
          <Content>{children}</Content>
          <Footer>
            {onCancel && (
              <ModalButton
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
        </StyledModal>
      </Wrapper>
    </div>
  );

  return isOpen ? ReactDOM.createPortal(modal, document.body) : null;
};
