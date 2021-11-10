import Datetime from 'react-datetime';
import styled from 'styled-components';
import 'react-datetime/css/react-datetime.css';

// This is an example of usage of a component
// In the form we can use <Datetime value{controledValue} />
// and contorledValue.unix() to get the timestamp.
// https://www.npmjs.com/package/react-datetime API here
// for example: onChange, onClose, onNavigate, etc.

const Label = styled.div`
  text-align: left;
  font-size: smaller;
  width: 200px;
  margin: auto;
`;
const Date = styled(Datetime)`
  input {
    background-color: white;
    border-radius: 6px;
    border-color: #526dfe;
    border-style: solid;
    padding: 2% 0;
    text-align: center;
    font-size: x-large;
    width: 200px;
  }
`;

export const InputDate = ({ onChange, value, text = null }) => (
  <div>
    <Label>{text}</Label>
    <Date
      value={value}
      onChange={onChange}
      dateFormat="DD/MM/YYYY"
      timeFormat={false}
    />
  </div>
);
