import { toast } from 'react-toastify';

export default function ErrorToast(
  content) {
  return toast.error(content, {
position: "bottom-right",
autoClose: 5000,
hideProgressBar: false,
closeOnClick: true,
pauseOnHover: true,
draggable: true,
progress: undefined,
});
}

