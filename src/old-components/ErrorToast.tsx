import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Button } from './common';
import { Modal } from './Modal';

export const ErrorToastButton = styled(Button)`
  background-color: #e74c3c;
`;

export default function ErrorToast(toastText, modalText) {
  return toast.error(
    <div>
      {toastText}
      <ErrorToastButton>More</ErrorToastButton>
      <Modal
        header={<h1>Error</h1>}
        isOpen={true}
        onDismiss={() => console.log(1)}
        onConfirm={() => navigator.clipboard.writeText(modalText)}
        onCancel={() => console.log(1)}
        confirmText={'Copy to Clipboard'}
        cancelText={'Contact'}
      >
        <p>{modalText}</p>
      </Modal>
    </div>,
    {
      position: 'bottom-right',
      autoClose: 50000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    }
  );
}
