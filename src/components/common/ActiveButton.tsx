import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

const Button = styled.div`
    background-color: ${({ theme }) => theme.activeButtonBackground};
    border-radius: 4px;
    color: white;
    height: 34px;
    letter-spacing: 1px;
    font-weight: 500;
    line-height: 34px;
    text-align: center;
    cursor: pointer;
    width: max-content;
    padding: 0px 10px;
    margin: 5px;
`;

const ButtonWithRouter = withRouter(
  ({ route, history, children }) => {
    return (
      <Button onClick={() => { history.push(route)}} >
        {children}
      </Button>
    );
  }
);
const ActiveButton = ({ children, onClick = undefined, route = undefined }) => {
    if (route) {
      return <ButtonWithRouter route={route}>{children}</ButtonWithRouter>
    } else {
      return <Button onClick={onClick}>{children}</Button>;
    }
};

export default ActiveButton;
