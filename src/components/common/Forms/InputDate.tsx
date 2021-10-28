import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

// This is an example of usage of a component
// In the form we can use <Datetime value{controledValue} />
// and contorledValue.unix() to get the timestamp.
// https://www.npmjs.com/package/react-datetime API here
// for example: onChange, onClose, onNavigate, etc.
export const InputDate = () => <Datetime />;
