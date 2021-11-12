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
  width: ${props => `${props.width}px`};
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
    width: ${props => `${props.width}px`};
  }
  .rdtPicker {
    left: 50%;
    transform: translateX(-50%);
  }
`;

export const InputDate = ({ onChange, value, text = null, width = 200 }) => (
  <div>
    <Label width={width}>{text}</Label>
    <Date
      value={value}
      onChange={onChange}
      dateFormat="DD/MM/YYYY"
      timeFormat={false}
      width={width}
    />
  </div>
);
