import styled from 'styled-components';
import DateTime from 'react-datetime';
import { Moment } from 'moment';
import 'react-datetime/css/react-datetime.css';
import Input from './Input';

const StyledDateTime = styled(DateTime)`
  .rdtPicker {
    background: ${({ theme }) => theme.colors.modalBackground};
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.25);
    border: 1px solid ${({ theme }) => theme.colors.muted};
    padding: 1.5rem;
    border-radius: 0.625rem;
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.proposalText.grey};
    position: fixed;
  }

  .rdtPicker .rdtMonths td,
  .rdtPicker .rdtYears td {
    height: 3.5rem;
  }

  .rdtPicker .rdtDays td,
  .rdtPicker .rdtDays th,
  .rdtPicker .rdtMonths th,
  .rdtPicker .rdtYears th {
    height: 2.5rem;
    width: 2.5rem;
  }

  .rdtPicker td.rdtYear:hover,
  .rdtPicker td.rdtMonth:hover,
  .rdtPicker td.rdtDay:hover,
  .rdtPicker td.rdtHour:hover,
  .rdtPicker td.rdtMinute:hover,
  .rdtPicker td.rdtSecond:hover,
  .rdtPicker .rdtTimeToggle:hover {
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 50%;
    outline: 1px solid ${({ theme }) => theme.colors.text};
  }

  .rdtPicker td.rdtOld,
  .rdtPicker td.rdtNew {
    color: ${({ theme }) => theme.colors.proposalText.grey};
  }

  .rdtPicker td.rdtToday:before {
    display: none;
  }

  .rdtPicker td.rdtActive,
  .rdtPicker td.rdtActive:hover {
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.background};
  }

  .rdtPicker th {
    border: none;
  }

  .rdtPicker th.rdtNext,
  .rdtPicker th.rdtPrev {
    vertical-align: middle;
  }

  .rdtPicker th.rdtSwitch:hover,
  .rdtPicker th.rdtNext:hover,
  .rdtPicker th.rdtPrev:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const DateInput = ({
  value,
  onChange,
  width = 200,
  isValidDate = (date: Moment) => true,
}) => (
  <StyledDateTime
    value={value}
    onChange={onChange}
    dateFormat="DD/MM/YYYY"
    timeFormat={false}
    isValidDate={isValidDate}
    renderInput={(props, openCalendar) => (
      <Input onClick={openCalendar} {...props} />
    )}
  />
);

export default DateInput;
