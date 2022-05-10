import styled from 'styled-components';
export const Button = styled.button`
  background-color: ${({ theme }) => theme.activeButtonBackground};
  border-radius: 4px;
  color: white;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  width: ${props => (props.width ? props.width : 'max-content')};
  padding: 0px 10px;
  margin: 5px;
  border: 0px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  :disabled {
    opacity: 0.4;
    cursor: auto;
  }
`;
