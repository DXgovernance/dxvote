import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Button } from './common';

export const ErrorToastButton = styled(Button)`
  background-color: #e74c3c; 
`;

export default function ErrorToast(
  content) {
  return toast.error(<div>
    {content}
    <ErrorToastButton>More</ErrorToastButton>
  </div>, {
position: "bottom-right",
autoClose: 50000,
hideProgressBar: false,
closeOnClick: true,
pauseOnHover: true,
draggable: true,
progress: undefined,
});
}

