import styled from 'styled-components';
import ReactDOM from 'react-dom';
import { isMobile, isDesktop } from 'react-device-detect';

import { Button } from '../Button';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import { Heading } from '../Typography';
import { Button } from '../Button';
import { isMobile } from 'react-device-detect';

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
    height: 100vh;
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

  @media only screen and (max-width: 768px) {
    width: 100%;
    height: 100vh;
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const StyledModal = styled.div`
  z-index: 100;
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  margin: auto;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.curved2};
  box-sizing: border-box;
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.25);

  @media only screen and (max-width: 768px) {
    border: none;
    box-shadow: none;
    position: fixed;
    width: 100%;
    height: 100vh;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.25rem 1.5rem;
  position: relative;
  align-items: center;
  display: flex;
`;

export const HeaderText = styled(Heading)`
  margin: 0;
`;

const CloseIcon = styled(FiX)`
  position: absolute;
  color: ${({ theme }) => theme.colors.text};
  right: 20px;
  top: 25px;
  transform: translateY(-50%);
  height: 1.5rem;
  width: 1.5rem;
  z-index: 500;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

export const Content = styled.div`
  color: ${({ theme }) => theme.colors.text};
  max-height: 80vh;
  overflow-x: hidden;
  overflow-y: hidden;
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
  children: JSX.Element;
  hideHeader?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  maxWidth?: number;
}

export const ModalButton = styled(Button)`
  margin: 8px;
  flex: 1;
`;

export const Divider = styled.hr`
  background: ${({ theme }) => theme.colors.text};
  width: 100%;
  position: fixed;
  z-index: 800;
  top: 64px;
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
      {isMobile && (
        <>
          <Divider />
          <CloseIcon onClick={onDismiss} />
        </>
      )}
      <Wrapper maxWidth={maxWidth}>
        {!isMobile && <CloseIcon onClick={onDismiss} />}
        <StyledModal>
          {!hideHeader && isDesktop && (
            <Header>
              <HeaderText>{header}</HeaderText>
            </Header>
          )}
          {!hideHeader && isMobile && (
            <Header onClick={onDismiss}>
              <FiArrowLeft />
              <HeaderText>{header}</HeaderText>
            </Header>
          )}

          <Content>{children}</Content>
          {(onCancel || onConfirm) && (
            <Footer>
              {onCancel && (
                <ModalButton
                  variant="primary"
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
